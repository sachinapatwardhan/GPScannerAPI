# User Hierarchy

## 1. Module Purpose

The User Hierarchy module models the multi-tiered distribution and sales chain for GPS device deployment in the **GPScannerAPI / Maark** platform. It governs:

- How users at each level (Super Admin → Distributor → Sales Agent → Retailer → Customer/End User) are created and managed.
- How GPS devices flow from the platform down through the hierarchy — assigned to distributors, allocated to sales agents, sold to retailers, and ultimately activated for end customers.
- How relationships between hierarchy nodes are tracked and queried through dedicated assignment tables.

**Controllers involved:**

| File | Route Prefix | Responsibility |
|---|---|---|
| `controllers/user.js` | `/user` | CRUD for Admin, Distributor, Sales Agent, Retailer, Customer accounts; listing and deletion |
| `controllers/admin.js` | `/admin` | Sales Agent autocomplete, GPS device assignment to agents, bulk device import via Excel |
| `controllers/distributor.js` | `/distributor` | Distributor user lookup; assignment of devices to distributors (`tbldeviceagentretailer.idDistributor`) |
| `controllers/retailer.js` | `/retailer` | Retailer email autocomplete; client list per retailer; device activation autocomplete |
| `controllers/salesAgent.js` | `/salesAgent` | Retailer account registration under a sales agent; device inventory dashboards for agents |
| `controllers/assignretailer.js` | `/assignretailer` | Listing, creating, and removing Agent↔Retailer links (`tblagentretailer`) |
| `controllers/assigndistributor.js` | `/assigndistributor` | Listing, creating, and updating Device↔Distributor assignments; bulk Excel import |
| `controllers/assignagentretailer.js` | `/assignagentretailer` | Listing, updating, and bulk Excel import of Device↔Agent↔Retailer assignments (`tbldeviceagentretailer`) |

**Core models:**

| Model | Table | Purpose |
|---|---|---|
| `tbluserinformation` | `tbluserinformation` | Single user table for all roles |
| `tbluserinrole` | `tbluserinrole` | Many-to-many: user ↔ role |
| `tblrole` | `tblrole` | Role definitions (`Super Admin`, `Distributor`, `Sales Agent`, `Retailer`, `User`, `Scanner`, …) |
| `tblagentretailer` | `tblagentretailer` | Sales Agent ↔ Retailer assignments |
| `tbldeviceagentretailer` | `tbldeviceagentretailer` | Device ↔ Agent ↔ Retailer assignments (also used for distributor via `idDistributor`) |
| `tblgpsdevice` | `tblgpsdevice` | GPS device master registry |
| `tblappinfo` | `tblappinfo` | White-label application configuration |

---

## 2. Business Workflow (Step-by-Step)

### Step 1 — Super Admin Creates Application Context
The platform is multi-tenant. Each white-label deployment is identified by a record in `tblappinfo` (AppName, AppId). All users and devices are scoped to an `idApp`.

### Step 2 — Super Admin Creates a Distributor
1. Admin sends `POST /user/SaveUserDistributor` with `{ id: 0, email, username, phone, password, idApp }`.
2. JWT token verified; caller must exist as a valid user.
3. Uniqueness checked: no existing user in the same `idApp` may share the `email`, `phone`, or `username`.
4. Password encrypted and user created via `User.findOrCreate()`.
5. `ManageDistributorUserRole()` looks up or creates the `Distributor` role in `tblrole` and inserts a row into `tbluserinrole`.
6. Distributor account is now visible via `GET /distributor/GetAllDistributor` (filtered by `idApp`).

### Step 3 — Admin Assigns GPS Devices to a Distributor
1. Admin sends `POST /assigndistributor/SaveDeviceDistributor` with `{ id: 0, deviceId, idDistributor, AppName }`.
2. JWT verified; `tblgpsdevice` is queried to confirm the `deviceId` exists under the given `AppName`.
3. Duplicate check: if a row with `{ idDistributor, deviceId }` already exists in `tbldeviceagentretailer`, the request is rejected.
4. A new `tbldeviceagentretailer` row is created with `{ deviceId, idDistributor, createdDatetime }`.
5. Bulk import is supported via `POST /assigndistributor/uploadExcelDevice` — the Excel file must have a `DeviceID` column header; each row is processed sequentially.

### Step 4 — Admin Creates a Sales Agent
1. Admin sends `POST /user/SaveUser` or `POST /user/SaveUserNew` with `{ id: 0, email, username, phone, roleId: [{ id: <Sales Agent role id> }], idApp }`.
2. Uniqueness validated. A random strong password is auto-generated.
3. User created via `User.findOrCreate()`.
4. All prior roles destroyed, `Sales Agent` role entry created in `tbluserinrole`.
5. Sales Agent appears in `GET /user/GetAllDynamicUser` and `GET /salesAgent/GetAllSalesAgent`.

### Step 5 — Admin Assigns GPS Devices to a Sales Agent
1. Admin sends `POST /admin/assignDevice` with `{ assign: true, deviceId, userId, appName }`.
2. `tbldeviceagentretailer` checked — device must not already be assigned.
3. `tblgpsdevice` confirms the device exists under `appName`.
4. `tbluserinformation` confirms the target user (Sales Agent) exists.
5. New row inserted: `{ agentId: userId, deviceId, createdDatetime }`.
6. Unassignment (when `assign: false`): the existing row is destroyed only if `retailerId` is null (device not yet sold).
7. Bulk assignment via `POST /admin/assignDeviceByExcel` or `POST /admin/assignDeviceByExcelNew` — Excel template has columns `IMEI` and `Assign To Username`. The `New` variant additionally validates that the target username belongs to a `Sales Agent` role within the correct app.

### Step 6 — Sales Agent Creates a Retailer Account
1. Sales Agent calls `POST /salesAgent/registerRetailerAccount` with `{ email, profileName, phone, agentId, appId, password }`.
2. A Sequelize **transaction** is used for atomicity.
3. `User.findOrCreate()` checks by `email OR username` — if the email already exists, throws `'An account with this email already exists.'`.
4. New user created with `IsMobileVerify: false` and `createdby: agentId`.
5. `tblagentretailer` row created linking `{ agentId, retailerId: newUser.id, createdDatetime }`.
6. `Retailer` role looked up in `tblrole` and assigned via `tbluserinrole`.
7. Redis cache refreshed via `updateUserRedisValue()`.

### Step 7 — Admin/Agent Creates an Agent↔Retailer Assignment
1. `GET /assignretailer/SaveAssignRetailer` with `{ agentId, retailerId }` (uses JWT for auth).
2. Duplicate checked via `AgentRetailer.findOne({ where: { agentId, retailerId } })`.
3. If not duplicate, `AgentRetailer.create()` inserts the relationship.
4. To remove: `GET /assignretailer/removeAssignRetailer` calls `AgentRetailer.destroy()`.

### Step 8 — Agent Transfers a Device to a Retailer
1. `POST /assignagentretailer/SaveAgentDeviceRetailer` with `{ id, retailerId }`.
2. JWT verified. Existing `tbldeviceagentretailer` row found by `id`.
3. Duplicate check: if `{ agentId, retailerId, deviceId }` combination already exists (and has a different `id`), the request is rejected.
4. `updateAttributes({ retailerId })` updates the row — the `retailerId` column is set on the existing agent assignment record.
5. Bulk update via `POST /assignagentretailer/uploadExcelDevice` — Excel must have `DeviceID` column; for each row, the existing agent+device record is found and its `retailerId` updated.

### Step 9 — Retailer Activates Device for a Customer
1. Retailer calls `GET /retailer/getAutocompleteActivateDeviceIds` with `{ retailerId, deviceId }`.
2. The retailer's `agentId` is looked up from `tblagentretailer`.
3. Unactivated devices (`activatedDatetime IS NULL OR expiryDatetime < now`) belonging to that agent are returned as options.
4. When activation is performed (in the vehicles/activation flow), the `activatedDatetime` and `expiryDatetime` fields on `tbldeviceagentretailer` are set.

### Step 10 — Customer Creation
1. Customer created by admin via `POST /user/SaveCustomer` or self-registered via `/account/MobileRegisterNew`.
2. Assigned the `User` role in `tbluserinrole`.
3. Customer may view their own device(s) via the mobile app.

---

## 3. Actor Interactions

### Hierarchy Tree
```
Super Admin
  └── Distributor (device inventory allocation)
        └── Sales Agent (device stock management)
              └── Retailer (device sale & activation)
                    └── Customer / End User (device ownership)
```

### Interaction Matrix

| Actor | Creates | Manages | Queries |
|---|---|---|---|
| **Super Admin** | All user types, all device assignments | Any user, any assignment, impersonate any account | All listing endpoints; filtered by app or unrestricted |
| **Distributor** | — (typically created by admin) | Sub-users via `SaveUserDistributor` | `GET /distributor/GetAllDistributor`, `GET /assigndistributor/GetAllAssignDistributor`, own devices |
| **Sales Agent** | Retailer accounts via `POST /salesAgent/registerRetailerAccount` | Agent↔Retailer assignments, device transfers to retailers | `GET /salesAgent/GetActivatedDevices`, `GET /salesAgent/getPagedDevicesByAgentId`, `GET /assignretailer/GetAllSalesAgent` |
| **Retailer** | — (created by agent or admin) | Activates devices for customers | `GET /retailer/getPagedClientsByRetailerId`, `GET /retailer/getAutocompleteActivateDeviceIds`, `GET /salesAgent/GetNotAssignDeviceIdByAgentId` |
| **Customer (User)** | Self via `/account/register` or `/account/MobileRegisterNew` | Own profile, own password | Mobile app GPS tracking (handled by `/vehicles` and other controllers) |

---

## 4. Validation Rules

### User Creation (all admin-created users — `SaveUser`, `SaveUserNew`, `SaveCustomer`, `SaveUserDistributor`)
- **JWT required**: valid token decodes to an existing user; otherwise `InvalidToken`.
- **Access permission**: `funAccessPermission.CheckUserAccessPermission()` verifies the caller has `Added` (create) or `Modified` (update) permission on the target table (`x-requested-with` header).
- **Username uniqueness**: checked against `tbluserinformation` where `username` matches and `id != currentId` (for updates) and `idApp` matches (`SaveUserNew`, `SaveCustomer`).
- **Email uniqueness**: same scoping as username; conflict returns `"Email is already Exist..."`.
- **Phone uniqueness**: if phone is provided and non-empty, checked similarly; conflict returns `"Phone is already Exist..."`.
- **Role required**: `roleId[]` array must have at least one element; otherwise `"Please Select atleast One Role..."`.
- **Password**: for `SaveUserDistributor` (create), the caller provides the password in the request body — it is encrypted before storage. For `SaveUser`/`SaveUserNew` (create), a random password is auto-generated.

### Retailer Registration (`POST /salesAgent/registerRetailerAccount`)
- **Uniqueness**: `User.findOrCreate()` with `$or: [{ email }, { username: email }]` — uses email as username. If already exists: `"An account with this email already exists."`.
- **Required fields**: `email`, `profileName`, `phone`, `agentId`, `appId`, `password` — all taken from request body; no explicit blank checks in code, but DB constraints apply.
- **Transactional**: all steps (user creation, agent-retailer link, role assignment) are wrapped in a single Sequelize transaction. Any failure rolls back all changes.

### Device Assignment to Distributor (`POST /assigndistributor/SaveDeviceDistributor`)
- **JWT required**.
- **Device must exist**: `tblgpsdevice` queried by `{ DeviceId, AppName }`; not found → `"Invalid Device ID., Please insert valid Device ID."`.
- **No duplicate assignment**: `{ idDistributor, deviceId }` must be unique in `tbldeviceagentretailer`; duplicate → `"Device Distributor is already assigned..."`.
- **Update path**: when `id != 0`, the existing record must be found; otherwise `"Device Distributor is not Exist..."`.

### Device Assignment to Agent (`POST /admin/assignDevice`)
- **Device not already assigned**: `tbldeviceagentretailer` must not have an existing row for `deviceId`; if found → `"Device is already assigned."`.
- **GPS device must exist**: `tblgpsdevice` queried by `{ DeviceId, appName }`; not found → `"GPS device not found."`.
- **User (agent) must exist**: `tbluserinformation` queried by `userId`; not found → `"User not found."`.
- **Unassignment guard**: cannot unassign if `retailerId` is set → `"Unable to unassign device. Device has already been activated."`.
- **Excel import (New variant)**: target username must belong to a `Sales Agent` role within the correct app; otherwise the row is skipped and added to `whichFailed[]`.

### Agent↔Retailer Assignment (`GET /assignretailer/SaveAssignRetailer`)
- **JWT required**.
- **Duplicate check**: `AgentRetailer.findOne({ where: { agentId, retailerId } })`; duplicate → `"Agent Retailer is already Exist..."`.

### Device Transfer to Retailer (`POST /assignagentretailer/SaveAgentDeviceRetailer`)
- **JWT required**.
- **Record must exist**: `tbldeviceagentretailer` queried by `id`; not found → `"Device Agent is not Exist..."`.
- **Duplicate assignment check**: `{ agentId, retailerId, deviceId }` must be unique (excluding self); duplicate → `"Device Agent retailer is already assigned..."`.

### Excel Import (all bulk endpoints)
- File must be uploaded (non-empty path).
- First column of the sheet (`A1`) must match the expected header (`DeviceID` for distributor/agent-retailer, or `IMEI` for admin device assignment).
- `IMEI` column additionally has `Assign To Username` as column B (`B1`).
- If the worksheet is null (protected mode), returns `"Excel File is Protected.."`.
- Rows that fail individual device validation are collected into an error list (`Importerror[]` or `whichFailed[]`), and the overall operation returns partial success if at least one row succeeded.

---

## 5. API Endpoints

### `/user` — Hierarchy User Management

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/user/GetAllUser` | List all users (paginated, legacy) | Query: pagination, sort | DataTables-format response | No |
| GET | `/user/GetAllUserNew` | List all users (new) | Query: pagination, `idApp` | DataTables response | No |
| GET | `/user/GetAllDynamicUser` | Dynamic user list with role filter | Query: pagination, `appId`, `country`, role filters | DataTables response | No |
| GET | `/user/GetAllDynamicUserNew` | Dynamic user list (app-scoped) | Query: pagination, `appId`, `country`, `UserId` | DataTables response | No |
| GET | `/user/GetAllDynamicCustomer` | List customer-role users | Query: pagination, `appId`, `country` | DataTables response | No |
| GET | `/user/GetAllDynamicDistributorUser` | List distributor users | Query: pagination, `appId` | DataTables response | No |
| GET | `/user/GetAllOnlyDistributor` | List all distributor accounts | Query: `idApp?` | Array of users | No |
| GET | `/user/GetUserById` | Get single user by ID | Query: `id` | User object | No |
| GET | `/user/GetUserByEmail` | Get user by email | Query: `email` | User object | No |
| GET | `/user/GetUserByName` | Get user by username | Query: `username` | User object | No |
| GET | `/user/GetUserProfile` | Get current user profile | Header: `Authorization` | User object with roles | Yes (JWT) |
| GET | `/user/GetUserProfileNew` | Get profile (new) | Header: `Authorization` | User object with roles | Yes (JWT) |
| POST | `/user/SaveUser` | Create / update user (legacy) | Header: `Authorization`, Body: user object + `roleId[]` | `{ success, message, data }` | Yes (JWT) |
| POST | `/user/SaveUserNew` | Create / update user (app-scoped) | Header: `Authorization`, Body: user object + `roleId[]` + `idApp` | `{ success, message, data }` | Yes (JWT) |
| POST | `/user/SaveCustomer` | Create / update customer | Header: `Authorization`, Body: customer fields + `roleId[]` | `{ success, message, data }` | Yes (JWT) |
| POST | `/user/SaveUserDistributor` | Create / update distributor | Header: `Authorization`, Body: user fields + `password` + `idApp` | `{ success, message, data }` | Yes (JWT) |
| GET | `/user/DeleteUser` | Delete user by ID | Header: `Authorization`, Query: `idUser` | `{ success, message }` | Yes (JWT) |
| GET | `/user/DeleteDistributorUser` | Delete distributor user | Header: `Authorization`, Query: `idUser` | `{ success, message }` | Yes (JWT) |
| POST | `/user/SaveUserInRole` | Manually assign a role | Header: `Authorization`, Body: `{ userId, roleId }` | `{ success, message }` | Yes (JWT) |
| POST | `/user/UpdateCustomer` | Update customer record | Header: `Authorization`, Body: customer fields | `{ success, message }` | Yes (JWT) |
| GET | `/user/DeleteCustomer` | Delete customer by ID | Header: `Authorization`, Query: `idUser` | `{ success, message }` | Yes (JWT) |
| GET | `/user/GetAllDynamicOwnerCustomer` | List owner+customer accounts | Query: pagination, `appId` | DataTables response | No |
| GET | `/user/ExportOwnerCustomer` | Export owner/customer list to Excel | Query: filters | Excel file download | No |
| POST | `/user/uploadImage` | Upload user profile picture | Multipart: image file | `{ success, message, data }` | Yes (JWT) |

### `/admin` — Device Assignment to Sales Agents

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/admin/getAutocompleteSalesAgent` | Search sales agents by username | Query: `username` | `{ success, message, data: [{ id, username }] }` | No |
| GET | `/admin/getAutocompleteSalesAgentNew` | Search sales agents by username (app-scoped) | Query: `username`, `idApp` | `{ success, message, data }` | No |
| GET | `/admin/getAllGpsDevices` | List all GPS devices with assignment status | Query: DataTables params, `agentId?` | DataTables response with device+SIM data | No |
| GET | `/admin/getAllGpsDevicesNew` | List GPS devices (SQL-based, new) | Query: DataTables params, `AppName`, `agentId?` | DataTables response | No |
| POST | `/admin/assignDevice` | Assign / unassign device to a sales agent | Body: `{ assign: bool, deviceId, userId, appName }` | `{ success, message, data }` | No |
| POST | `/admin/transferStock` | Transfer device from one agent to another | Body: `{ deviceId, toAgentId }` | `{ success, message, data }` | No |
| POST | `/admin/assignDeviceByExcel` | Bulk assign devices via Excel | Multipart: Excel file, `appName`, `createdBy` | `{ success, message }` | No |
| POST | `/admin/assignDeviceByExcelNew` | Bulk assign devices via Excel (Sales-Agent-validated) | Multipart: Excel file, `appName`, `createdBy` | `{ success, message }` | No |
| GET | `/admin/downloadAssignDeviceExcelTemplate` | Download Excel template for device assignment | — | Excel file (`AssignDeviceTemplate.xlsx`) | No |

### `/salesAgent` — Sales Agent Retailer & Device Management

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| POST | `/salesAgent/registerRetailerAccount` | Create a Retailer account under an agent | Body: `{ email, profileName, phone, agentId, appId, password }` | `{ success, message, data }` | No |
| GET | `/salesAgent/getActivatedDevices` | Get activated/unactivated device counts + top retailers | Query: `agentId` | `{ success, message, data, notActivatedCount, activatedCount }` | No |
| GET | `/salesAgent/getPagedDevicesByAgentId` | Paginated device list for an agent | Query: `agentId`, DataTables params | DataTables response | No |
| GET | `/salesAgent/getPagedLicenceDevicesByAgentId` | Paginated licence-device list for agent | Query: `agentId`, `length`, `start`, `Search?` | `{ recordsTotal, data }` | No |
| GET | `/salesAgent/GetNotAssignDeviceIdByAgentId` | Devices belonging to agent but not in licence manager | Query: `agentId` | `{ success, message, data }` | No |

### `/retailer` — Retailer Operations

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/retailer/getAutocompleteEmail` | Search customer (User-role) emails | Query: `email`, `idApp` | `{ success, message, data }` | No |
| GET | `/retailer/findsimnumber` | Get SIM details for a GPS device | Query: `DeviceId` | SIM record | No |
| GET | `/retailer/getPagedClientsByRetailerId` | List customers linked to a retailer | Query: `retailerId`, DataTables params | DataTables response | No |
| GET | `/retailer/getAutocompleteActivateDeviceIds` | Search unactivated device IDs for a retailer | Query: `retailerId`, `deviceId` | `{ success, message, data }` | No |
| GET | `/retailer/getAutocompleteActivateSerialNums` | Search unassigned SIM serial numbers | Query: `SerialNum?` | `{ success, data }` | No |

### `/assignretailer` — Agent↔Retailer Assignments

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/assignretailer/GetAllSalesAgent` | List all sales agents (paginated) | Query: DataTables params, `appId?`, `country?`, `UserRoles` | DataTables response | No |
| GET | `/assignretailer/GetAllRetailer` | List all retailers for an app | Query: `idApp` | Array of user objects with roles | No |
| GET | `/assignretailer/GetAllAssignRetailer` | List all agent↔retailer assignments | Query: `idApp?` | Array of assignment records | No |
| GET | `/assignretailer/SaveAssignRetailer` | Create agent↔retailer link | Header: `Authorization`, Query: `agentId`, `retailerId` | `{ success, message, data }` | Yes (JWT) |
| GET | `/assignretailer/removeAssignRetailer` | Remove agent↔retailer link | Header: `Authorization`, Query: `agentId`, `retailerId` | `{ success, message, data }` | Yes (JWT) |

### `/assigndistributor` — Device↔Distributor Assignments

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/assigndistributor/GetAllDistributor` | List all distributor accounts | Query: `idApp?` | Array of `{ id, email }` | No |
| GET | `/assigndistributor/GetAllAssignDistributor` | List device↔distributor assignments (paginated) | Query: DataTables params, `appId?`, `AdvanceSearch` | DataTables response | No |
| POST | `/assigndistributor/SaveDeviceDistributor` | Assign / update device to distributor | Header: `Authorization`, Body: `{ id, deviceId, idDistributor, AppName }` | `{ success, message, data }` | Yes (JWT) |
| GET | `/assigndistributor/DownloadTemplate` | Download Excel template | — | Excel file (`AssignDeviceDistributor_Template.xlsx`) | No |
| POST | `/assigndistributor/uploadExcelDevice` | Bulk assign devices to distributor | Multipart: Excel file, `idDistributor`, `AppName` | `{ success, message }` | No |
| GET | `/assigndistributor/ExportDeviceDistributor` | Export assignments to Excel | Query: filters, `UserRoles` | Excel file (`Distributor.xlsx`) | No |

### `/assignagentretailer` — Device↔Agent↔Retailer Assignments

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/assignagentretailer/GetAllAgent` | List all sales agents | Query: `idApp?` | Array of `{ id, email }` | No |
| GET | `/assignagentretailer/GetAllAgentRetailer` | List device↔agent↔retailer assignments (paginated) | Query: DataTables params, `AdvanceSearch` | DataTables response | No |
| POST | `/assignagentretailer/SaveAgentDeviceRetailer` | Update retailer on existing agent-device record | Header: `Authorization`, Body: `{ id, retailerId }` | `{ success, message, data }` | Yes (JWT) |
| GET | `/assignagentretailer/DownloadTemplate` | Download Excel template | — | Excel file (`AssignDeviceAgentRetailer_Template.xlsx`) | No |
| POST | `/assignagentretailer/uploadExcelDevice` | Bulk update retailer assignments via Excel | Multipart: Excel file, `agentId`, `retailerId` | `{ success, message }` | No |
| GET | `/assignagentretailer/ExportAgentRetailer` | Export agent↔retailer assignments to Excel | Query: filters, `UserRoles` | Excel file (`AgentRetailer.xlsx`) | No |

### `/distributor` — Distributor Queries

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/distributor/GetAllDistributor` | List distributor users | Query: `idApp?` | Array of distributor accounts | No |
| GET | `/distributor/GetAllAssignDistributor` | List device-distributor assignments (paginated) | Query: DataTables params, `AdvanceSearch` | DataTables response | No |
| POST | `/distributor/SaveDeviceDistributor` | Assign / update device to distributor | Header: `Authorization`, Body: `{ id, deviceId, idDistributor, AppName }` | `{ success, message, data }` | Yes (JWT) |
| GET | `/distributor/DownloadTemplate` | Download Excel import template | — | Excel file (`AssignDeviceDistributor_Template.xlsx`) | No |
| POST | `/distributor/uploadExcelDevice` | Bulk device-distributor import | Multipart: Excel, `idDistributor`, `AppName` | `{ success, message }` | No |
| GET | `/distributor/ExportDeviceDistributor` | Export to Excel | Query: filters | Excel download | No |

---

## 6. Database Interactions

### `tbluserinformation`
| Operation | Context | Key Filter / Fields |
|---|---|---|
| `findOne` (token verify) | All write endpoints | `username`, `password` from decoded JWT |
| `findAll` / SQL SELECT | Listing endpoints (GetAllDynamicUser, GetAllSalesAgent, etc.) | Joined with `tbluserinrole`, `tblrole`, `tblappinfo`; filtered by `RoleName` |
| `findOrCreate` (create user) | `SaveUser`, `SaveUserNew`, `SaveCustomer`, `SaveUserDistributor`, `registerRetailerAccount` | `username`, `password`; `defaults` = full user object |
| `update` (update user) | `SaveUser`, `SaveUserNew`, `SaveCustomer`, `SaveUserDistributor` | `id`; all updatable fields |
| `destroy` (delete user) | `DeleteUser`, `DeleteCustomer`, `DeleteDistributorUser` | `id` |
| `findAll` (autocomplete) | `getAutocompleteSalesAgent`, `getAutocompleteEmail` | `username LIKE`, `email LIKE`, with role join |

### `tbluserinrole`
| Operation | Context | Key Filter / Fields |
|---|---|---|
| `findAll` (login) | Login flows | `userId`; joined with `tblrole` for `RoleName` |
| `create` | All user creation flows | `{ userId, roleId }` |
| `destroy` (rebuild roles) | `SaveUser`, `SaveUserNew`, `SaveCustomer`, `SaveUserDistributor` | `userId` — all existing roles deleted before re-inserting |

### `tblrole`
| Operation | Context | Key Filter / Fields |
|---|---|---|
| `findOne` | Login role resolution, `ManageDistributorUserRole`, `registerRetailerAccount`, `MobileRegister` | `RoleName` = `'User'`, `'Retailer'`, `'Distributor'`, `'Sales Agent'`, `'Super Admin'`, `'Scanner'` |
| `create` | If role doesn't exist (defensive creation) | `{ RoleName, Description, Country }` |

### `tblagentretailer`
| Operation | Context | Key Filter / Fields |
|---|---|---|
| `findOne` (duplicate check) | `SaveAssignRetailer` | `{ agentId, retailerId }` |
| `findOne` (retailer's agent lookup) | `getAutocompleteActivateDeviceIds` | `{ retailerId }` → returns `agentId` |
| `create` | `SaveAssignRetailer`, `registerRetailerAccount` | `{ agentId, retailerId, createdDatetime }` |
| `destroy` | `removeAssignRetailer` | `{ agentId, retailerId }` |

### `tbldeviceagentretailer`
| Operation | Context | Key Filter / Fields |
|---|---|---|
| `findOne` (existence check) | `assignDevice`, `SaveDeviceDistributor`, `SaveAgentDeviceRetailer`, `transferStock` | `{ deviceId }` or `{ agentId, deviceId }` or `{ idDistributor, deviceId }` |
| `findAll` | `getActivatedDevices`, `getPagedDevicesByAgentId`, `GetNotAssignDeviceIdByAgentId`, `getAutocompleteActivateDeviceIds` | `agentId`, `retailerId`, `activatedDatetime`, `expiryDatetime` |
| `findAndCountAll` | `getPagedDevicesByAgentId` | `agentId`; joined with `tbluserinformation` on `retailerId` |
| `create` | `assignDevice`, `SaveDeviceDistributor`, `uploadExcelDevice` | `{ agentId, deviceId, createdDatetime }` or `{ idDistributor, deviceId, createdDatetime }` |
| `update` (transfer) | `transferStock` | `{ agentId: toAgentId }` |
| `updateAttributes` | `SaveAgentDeviceRetailer`, `uploadExcelDevice` (agent-retailer) | `{ retailerId }` or `{ lastModifiedDatetime }` |
| `updateAttributes` (SaveDeviceDistributor edit) | — | `{ deviceId, idDistributor, lastModifiedDatetime }` |
| `destroy` (unassign) | `assignDevice` (assign=false) | `{ agentId, deviceId }` |

### `tblgpsdevice`
| Operation | Context | Key Filter |
|---|---|---|
| `findOne` | `assignDevice`, `SaveDeviceDistributor`, `uploadExcelDevice` (distributor), `assignDeviceByExcel` | `{ DeviceId, AppName }` |
| `findAndCountAll` / SQL SELECT | `getAllGpsDevices`, `getAllGpsDevicesNew` | `AppName`, optional `agentId` exclusion |

---

## 7. Edge Cases & Error Handling

### Token / Authentication
- All write operations in `user.js`, `assignretailer.js`, `assigndistributor.js`, `assignagentretailer.js`, and `distributor.js` require a valid JWT in the `Authorization` header.
- Missing token: `getToken(headers)` returns null → `InvalidToken` response (`{ success: false, message: "Invalid Token." }`).
- Valid token but no matching user in DB: `InvalidToken` response.
- Access permission check failure: `NoAccessPermission` response (`{ success: false, message: ... }`).

### Duplicate Assignments
- **Device already assigned to agent**: `"Device is already assigned."` — prevents double-assignment in `assignDevice`.
- **Device already assigned to distributor**: `"Device Distributor is already assigned..."` — checked in `SaveDeviceDistributor`.
- **Agent↔Retailer already linked**: `"Agent Retailer is already Exist..."` in `SaveAssignRetailer`.
- **Agent↔Device↔Retailer already assigned**: `"Device Agent retailer is already assigned..."` in `SaveAgentDeviceRetailer`.

### Device Has Been Sold / Activated
- `transferStock`: if `rDeviceAgentRetailer.retailerId` is not null, throws `"Unable to transfer device. This device has already been sold."` — blocks re-transfer of sold devices.
- `assignDevice` (unassign): if `retailerId` is set on the record, throws `"Unable to unassign device. Device has already been activated."` — prevents removing already-sold devices from agent stock.

### Device / User Not Found
- `assignDevice` (assign): GPS device not in `tblgpsdevice` → `"GPS device not found."`.
- `assignDevice` (assign): target `userId` not in `tbluserinformation` → `"User not found."`.
- `transferStock`: `deviceId` not in `tbldeviceagentretailer` → `"Unable to transfer device. Device ID not found."`.
- `SaveDeviceDistributor`: `deviceId` not valid in `tblgpsdevice` for the given `AppName` → `"Invalid Device ID., Please insert valid Device ID."`.
- `SaveDeviceDistributor` (update): `id` not found → `"Device Distributor is not Exist..."`.
- `SaveAgentDeviceRetailer` (update): `id` not found → `"Device Agent is not Exist..."`.
- `getAutocompleteActivateDeviceIds`: if `retailerId != 0` but no `tblagentretailer` record found for the retailer → `"No record(s) found."`.
- `retailer/findsimnumber`: GPS device not found → `"Gps device not found.."`, SIM not linked → `"Sim not found.."`.

### Retailer Account Creation (Transactional)
- The `registerRetailerAccount` endpoint wraps all three operations (user creation, agent-retailer link, role assignment) in a single Sequelize transaction.
- If any step throws (including the duplicate-email check throwing `BugzError`), the entire transaction is rolled back.
- The thrown error message is surfaced directly to the client in the `message` field.

### Excel Import Edge Cases
- **No file uploaded**: `"No File Found.."` (empty `FileName` array).
- **Protected/null worksheet**: `"Error in Import , Excel File is Protected.."`.
- **Wrong column headers**: `"Excel File is Not in Valid Format, You can Download Template for import Excel File."`.
- **Empty data rows**: `"No Data in Excel File.."`.
- **Partial failure**: if some rows fail (device not found, already assigned, etc.), those `deviceId` values are pushed to `Importerror[]` or `whichFailed[]`. Response returns `success: true` with a count of failures: `"Excel File uploaded successfully..Failed To Import : N"`. If **all** rows fail (in `assignDeviceByExcel`), `success` is set to `false`.
- **IMEI parsing**: in `assignDeviceByExcel*`, the IMEI cell value has its first character stripped with `.substring(1)` to remove a leading quote character that Excel may prepend to numeric-looking strings.

### Role Missing from `tblrole`
- `registerRetailerAccount`: if the `Retailer` role does not exist in `tblrole`, the transaction will fail (no defensive creation — `Role.findOne()` result is used directly without a fallback).
- `ManageDistributorUserRole()` (called from `SaveUserDistributor`): **does** have a fallback — if the `Distributor` role is not found, it creates a new role record before assigning it.
- `MobileRegister`, `MobileRegisterNew`, `register`: if the `User` role doesn't exist, the code creates it with `Role.create({ RoleName: "User", Description: null })`.

### App Scope Mismatches
- `GetAllDistributor`, `GetAllAgent`, `GetAllSalesAgent` — all accept an optional `idApp` filter. When `idApp` is provided, only users from that app are returned.
- `GetAllAssignDistributor` / `GetAllAgentRetailer` — support both top-level `appId` and `AdvanceSearch.idApp` filters, allowing the same query to be filtered from multiple sources (potential double-filter risk if both are supplied simultaneously).

### Concurrency / Race Conditions
- `findOrCreate` is used in `SaveUser`, `SaveUserNew`, `SaveCustomer`, `SaveUserDistributor`, and `registerRetailerAccount` to mitigate race conditions on user creation, but the duplicate check is done in a prior `findOne` step without a DB-level transaction in most paths outside `registerRetailerAccount`.

### Redis Cache Refresh
- Every operation that creates, updates, or deletes user or vehicle data calls `updateUserRedisValue(userId)`, which queries all vehicles for that user (`tblvehicle WHERE iduser = id`) and triggers `Commonfunction.UpdateVehicleRedis(deviceid, 'User')` for each. Failure of this step does not block the HTTP response.

### SuperAdmin-Only Operations
- Device assignment via `POST /admin/assignDevice` and `POST /admin/transferStock` do not require JWT themselves (no `getToken` call), but the corresponding listing/query endpoints are open.
- In contrast, the `assignretailer`, `assigndistributor`, and `assignagentretailer` write endpoints all enforce JWT authentication.
