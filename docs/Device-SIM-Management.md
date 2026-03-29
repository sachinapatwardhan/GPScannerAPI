# Device & SIM Management

## Table of Contents

1. [Module Purpose](#1-module-purpose)
2. [Business Workflow](#2-business-workflow-step-by-step)
3. [Actor Interactions](#3-actor-interactions)
4. [Validation Rules](#4-validation-rules)
5. [API Endpoints](#5-api-endpoints)
6. [Database Interactions](#6-database-interactions)
7. [Edge Cases & Error Handling](#7-edge-cases--error-handling)

---

## 1. Module Purpose

The Device & SIM Management module handles the operational infrastructure layer of the Maark GPS platform. It manages the physical GPS tracking hardware (devices), the SIM cards inserted in them, the assignment of devices between sales agents and end-users, cross-customer vehicle sharing, and the replacement lifecycle of SIM cards.

**Controllers involved:**

| Controller File | Route Prefix | Responsibility |
|---|---|---|
| `controllers/deviceacc.js` | `/deviceacc` | Device ACC (ignition threshold) value logging and admin review |
| `controllers/sharedevice.js` | `/sharedevice` | Sharing a vehicle/device with another user, invitation emails, notification settings, group sharing |
| `controllers/sim.js` | `/sim` | Full SIM card lifecycle — create, update, bulk import, export, attach/detach, renewal tracking |
| `controllers/simreplace.js` | `/simreplace` | SIM swap operations — record replacement history and swap the SIM assignment on the GPS device |
| `controllers/SalesAgentDevice.js` | `/SalesAgentDevice` | Sales agent mobile app — login, device provisioning, renewal pipeline, admin impersonation |

**Models used:** `tblsimdetails`, `tblsimreplace`, `tblgpsdevice`, `tblvehicle`, `tbluserinformation`, `tblsharedevice`, `tblsharedemail`, `tblemailtemplate`, `tblemailsettingsys`, `tblappinfo`, `tbllicencemanager`, `tbldeviceagentretailer`, `tblrole`, `tbluserinrole`, `tbldeviceaccvalueset`

---

## 2. Business Workflow (Step-by-Step)

### 2.1 SIM Card Registration & Assignment

1. **Register SIM** — `POST /sim/SaveSIMInfo` creates a new record in `tblsimdetails` keyed on `SerialNum` (uniqueness enforced via `findOrCreate`). On creation, `CreatedDate` is stamped.  If `Status` is set to `'Spoil'` at creation time, `SpoilDate` is also set.
2. **Bulk Import** — `POST /sim/uploadExcelDevice` allows administrators to upload an XLSX or CSV file. Each row with at least `SerialNumber` and `PhoneNumber` columns is imported into `tblsimdetails` via an iterative loop.
3. **Attach SIM to GPS Device** — `GET /sim/AttachSimMDetail` links a SIM (by `SerialNum`) to a GPS device (by `DeviceId`). It looks up the SIM ID from `tblsimdetails`, then updates `tblgpsdevice.idSim` and `tblgpsdevice.SimNum`.
4. **Detach SIM** — `GET /sim/DetachSimTracker` clears `tblgpsdevice.idSim = null` for the specified device.

### 2.2 SIM Replacement Lifecycle

1. **Identify Old and New SIMs** — Both `OldSim` and `NewSim` serial numbers are validated against `tblsimdetails`. If either is not found, the operation aborts.
2. **Pre-empt Conflicts** — If the new SIM is already assigned to a different GPS device, that device's `idSim` is first set to `null` to free the SIM.
3. **Swap Assignment** — `POST /simreplace/SaveSimReplace` updates the GPS device (previously holding `OldSim`) to point to the `NewSim` ID.
4. **Mark Old SIM Spoiled** — `tblsimdetails.Status = 'Spoil'` and `SpoilDate = new Date()` are set on the old SIM.
5. **Activate New SIM** — `tblsimdetails.StartDate = new Date()`, `Status = null`, `SpoilDate = null` are set on the new SIM.
6. **Record History** — A row is inserted into `tblsimreplace` with `OldSim`, `NewSim`, `CreatedBy`, and `CreatedDate`.
7. **MDetail Variant** — `POST /simreplace/SaveSimReplaceMDetail` performs the same steps but without JWT authentication and sets `CreatedBy = 'MDetail'` (for automated M-Detail system swaps).

### 2.3 Device Sharing Flow

1. **Check Recipient Exists** — `POST /sharedevice/SaveSharedUserNew` looks up `tbluserinformation` by the supplied `email` and `idApp`. If the user does not exist, the operation returns an error.
2. **Prevent Duplicate Share** — `tblsharedevice` is checked for an existing row matching `{ DeviceId, idUser, idSharedUser }`.
3. **Create Share Record** — A new `tblsharedevice` row is created with `idUser` (owner), `idSharedUser` (recipient), `DeviceId`, `IsActive`, and timestamps.
4. **Real-Time Notification** — Socket.IO events `'ShareStatus'` and `'{userId}ShareStatus'` are emitted to notify the recipient's connected client immediately.
5. **Redis Update** — `Commonfunction.UpdateVehicleRedis(DeviceId, 'PushNotification')` refreshes the device's push notification subscriber list.

### 2.4 Sharing Invitation Flow (New User)

1. **Send Invitation** — `POST /sharedevice/InvitedNewUser` is used when the recipient does not yet have an account. A `tblsharedemail` row is created with `Status = 'Pending'`.
2. **Email Dispatch** — The system fetches the app's email configuration from `tblemailsettingsys` and an `"Invitation Email"` template from `tblemailtemplate`. The template body has `{AppName}`, `{email}`, and `{url}` placeholders replaced at runtime.
3. **Re-invite Logic** — If a pending invitation already exists for the same `{DeviceId, SharedEmail}` pair, its status is reset to `'Pending'` and the email is re-sent.
4. **Rejection** — `GET /sharedevice/RejectSharedInvitation` sets `tblsharedemail.Status = 'Rejected By Main User'` and sets `JourneyFlag = false`.

### 2.5 Group Vehicle Sharing Flow

1. **Validate Recipient** — `POST /sharedevice/SaveSharedGroupUserNew` verifies the recipient user by `email + idApp`.
2. **Iterate Group Vehicles** — All vehicles in `tblvehicle` with `IdGroup = X` belonging to the sharing user are iterated.
3. **Batch Insert** — For any vehicle not already shared with the recipient, a row is bulk-inserted into `tblsharedevice` using `INSERT INTO tblsharedevice ... VALUES ?`.
4. **Already Shared** — If all vehicles are already shared, returns `"Group of vehicle already shared this user."` rather than an error.

### 2.6 Sales Agent Device Provisioning Flow

1. **Sales Agent Login** — `GET /SalesAgentDevice/MobileAppLoginNew` authenticates the agent by `username | email | phone` + password, validates that the user has the `'Sales Agent'` role, and returns a JWT token.
2. **Scan Device IMEI** — The agent scans a GPS device. `GET /SalesAgentDevice/GetSIMByIMEI` fetches any currently attached SIM details from `tblgpsdevice` joined to `tblsimdetails`.
3. **Provision Device** — `POST /SalesAgentDevice/UpdateDeviceBySalesAgent` performs a upsert:
   - Validates the app via `tblappinfo`
   - Resolves or creates the SIM via internal `ManageSimFun` (creates `tblsimdetails` row if not present)
   - Checks that the SIM is not already assigned to a different device
   - Updates (or creates if new) the `tblgpsdevice` row: sets `idSim`, `SimNum`, `idSalesAgent`, `AppName`
   - Derives `DeviceId` from the IMEI by stripping the first character (`IMEI.slice(1)`)
   - Creates or updates a `tbldeviceagentretailer` row to record the agent–device relationship
4. **Renewal Pipeline** — `GET /SalesAgentDevice/GetAllRenewDataForSalesAgent` returns paginated renewal data scoped to the authenticated agent's devices (filtered by `tblgpsdevice.idSalesAgent` OR `tbldeviceagentretailer.agentId`), merged with live last-GPS-date from Redis.
5. **Admin Impersonation** — `POST /SalesAgentDevice/AdminInpersionateLogin` allows a `Super Admin` to generate a JWT token for any Sales Agent user without knowing their password.

### 2.7 Device ACC Value Review Flow

1. **Query** — `GET /deviceacc/GetAllDeviceAccValue` returns a paginated DataTables view of `tbldeviceaccvalueset`, joined LEFT to `tblgpsdevice` for `AppName`.
2. **Filter Options** — Supports filtering by `DeviceId`, `AppName`, date range (`StartDate`/`EndDate`), and `IsACCValueSet` flag.
3. **Use Case** — ACC value sets record the accelerometer/ignition thresholds calibrated for each physical device. Administrators use this view to audit or review calibration history.

---

## 3. Actor Interactions

| Actor | Module Access | Key Operations |
|---|---|---|
| **Super Admin / Platform Admin** | Full access | SIM create/update/delete, bulk import, export, SIM replacement, view all shared devices, admin impersonation of sales agents |
| **App Admin** | Scoped to their `idApp` | SIM management within their app, view sharing status, manage device ACC values |
| **End User (Subscriber / Vehicle Owner)** | `/sharedevice` endpoints | Share vehicle with others, accept/reject invitations, remove shared users, configure notification preferences |
| **Shared User (Recipient)** | `/sharedevice` read endpoints | View vehicles shared with them; adjust notification preferences on their share record |
| **Sales Agent** | `/SalesAgentDevice` | Mobile login, device IMEI scanning, SIM provisioning, renewal pipeline review |
| **MDetail Integration System** | `/simreplace/SaveSimReplaceMDetail` | Automated SIM replacement without user authentication (system-to-system) |
| **Mobile App** | `/SalesAgentDevice` | Sales agent app entrypoint for device provisioning and expiry management |

---

## 4. Validation Rules

### SIM Card (tblsimdetails)

| Field | Validation Rule | Source |
|---|---|---|
| `SerialNum` | Must be unique; duplicate returns `"SIM Info is already Exist..."` | `sim.js` SaveSIMInfo |
| `Id` == 0 | Triggers create path (`findOrCreate` by `SerialNum`) | `sim.js` SaveSIMInfo |
| `Id` > 0 | On update, checks that no other SIM with same `SerialNum` exists; if a different SIM uses the same serial, update is blocked | `sim.js` SaveSIMInfo |
| `Status = 'Spoil'` | Automatically sets `SpoilDate = new Date()` if transitioning from non-spoil | `sim.js` SaveSIMInfo |
| Delete `Id` | Must not be null or empty; uses hard `destroy` (permanent deletion) | `sim.js` DeleteSIMInfo |
| Bulk import | Rows with missing `SerialNumber` or `PhoneNumber` columns in the Excel sheet are silently skipped | `sim.js` uploadExcelDevice |

### SIM Replacement (tblsimreplace)

| Field | Validation Rule | Source |
|---|---|---|
| `OldSim` | Must exist in `tblsimdetails` by `SerialNum`; abort if not found | `simreplace.js` SaveSimReplace |
| `NewSim` | Must exist in `tblsimdetails` by `SerialNum`; abort if not found | `simreplace.js` SaveSimReplace |
| New SIM conflict | If `NewSim` is already assigned to another device, that device's `idSim` is cleared first (no blocking error) | `simreplace.js` SaveSimReplace |
| Old SIM on GPS device | `OldSim` must be assigned to a GPS device (`tblgpsdevice.idSim`); if not, returns `"Old SIM not exist in Gps Device..."` | `simreplace.js` SaveSimReplace |

### Device Sharing (tblsharedevice)

| Field | Validation Rule | Source |
|---|---|---|
| `email` | Must correspond to an existing user in `tbluserinformation`; unknown email returns `"User is not Exist..."` | `sharedevice.js` SaveSharedUserNew |
| `email + idApp` | `SaveSharedUserNew` additionally validates the user belongs to the correct app (scoped lookup) | `sharedevice.js` SaveSharedUserNew |
| Duplicate share | `{ DeviceId, idUser, idSharedUser }` must be unique; duplicate returns `"Vehicle is already Shared With This User..."` | `sharedevice.js` SaveSharedUser / SaveSharedUserNew |
| Group share — empty group | If the group contains no vehicles, returns `"Group has no vehicle found."` | `sharedevice.js` SaveSharedGroupUserNew |

### Sales Agent Provisioning

| Field | Validation Rule | Source |
|---|---|---|
| Login credentials | User must have the `'Sales Agent'` role (`tblrole.RoleName = 'Sales Agent'`); role check is done via eager-loaded `tblUserInRole → tblrole` join | `SalesAgentDevice.js` MobileAppLoginNew |
| `IMEI` | Looked up in `tblgpsdevice`; if not found, a new GPS device record is created (upsert) | `SalesAgentDevice.js` UpdateDeviceBySalesAgent |
| `idApp` | Must correspond to a valid `tblappinfo` record; returns `"Tacker Invalid.."` (typo in source: "Tracker") if app not found | `SalesAgentDevice.js` UpdateDeviceBySalesAgent |
| SIM already assigned | If the resolved SIM `id` is linked to a different GPS device, returns `"SIM Is Already assigned."` | `SalesAgentDevice.js` UpdateDeviceBySalesAgent |
| Admin impersonation | Token must decode to a `Super Admin` role (`decoded.Role.indexOf('Super Admin') >= 0`); otherwise returns `InvalidToken` | `SalesAgentDevice.js` AdminInpersionateLogin |
| Target user (impersonation) | Target `UserId` must exist and must have the `'Sales Agent'` role | `SalesAgentDevice.js` AdminInpersionateLogin |

### Device ACC Values

| Field | Validation Rule | Source |
|---|---|---|
| `DeviceId` filter | Optional; if supplied, restricts results using `LIKE '%value%'` | `deviceacc.js` GetAllDeviceAccValue |
| `IsACCValueSet` | Optional boolean filter; only integers `0` or `1` are meaningful | `deviceacc.js` GetAllDeviceAccValue |
| Date range | `StartDate` and `EndDate` are applied as `BETWEEN` or one-sided `>=` / `<=` on `tbldeviceaccvalueset.CreatedDate` | `deviceacc.js` |

### JWT Authentication

| Rule | Source |
|---|---|
| `SaveSIMInfo`, `DeleteSIMInfo`, `SaveSimReplace`, `SaveSharedUser*`, `InvitedNewUser*`, `RemoveSharedUser`, `RejectSharedInvitation`, `ChangeSharedNotificationSetting`, `ChangeNotificationSetting`, `GetAllRenewDataForSalesAgent` all require a valid JWT in the `Authorization` header | All controllers |
| Token is decoded with `jwt.decode(token, TokenKey)` and validated by querying `tbluserinformation` with `username + password` | All controllers |
| Missing or invalid token returns `InvalidToken` global object | All controllers |
| Sales Agent token uses `TokenKey = "bugz"` (a separate key used in `SalesAgentDevice.js`) | `SalesAgentDevice.js` |

---

## 5. API Endpoints

### `/deviceacc` — Device ACC Value Management

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/deviceacc/GetAllDeviceAccValue` | Paginated list of device ACC calibration records joined to GPS device app name | DataTables params + `DeviceId`, `AppName`, `StartDate`, `EndDate`, `IsACCValueSet` | DataTables JSON response | ❌ |

---

### `/sharedevice` — Vehicle Sharing

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/sharedevice/GetAllSharedVehicle` | List all vehicles with owner email and app (for share admin view) | `?appId={int}` | Array of `{ idVehicle, deviceId, email, id, idApp }` | ❌ |
| GET | `/sharedevice/GetAllSharedUser` | Paginated list of all share records with owner, recipient, vehicle name, app (DataTables) | DataTables params + `appId` | DataTables JSON response | ❌ |
| GET | `/sharedevice/GetAllSharedDeviceByUserNew` | Get all users sharing a specific device + pending email invitations | `?DeviceId&idSharedUser` | `{ lstSharedUser: [...], lstSharedInvite: [...] }` | ❌ |
| GET | `/sharedevice/GetAllSharedDeviceByUser` | Get all share records for a specific device and user | `?DeviceId&idSharedUser` | Array of share objects with user info | ❌ |
| POST | `/sharedevice/SaveSharedUser` | Share a vehicle with an existing user (by email, any app) | Body: `{ email, DeviceId, idSharedUser, ... }` | `{ success, message, data }` | ✅ JWT |
| POST | `/sharedevice/SaveSharedUserNew` | Share a vehicle with an existing user (scoped by `idApp`) | Body: `{ email, idApp, DeviceId, idSharedUser, ... }` | `{ success, message, data }` | ✅ JWT |
| GET | `/sharedevice/GetAllInvitedEmail` | Get all pending/sent invite records for a device | `?DeviceId={string}` | Array of `tblsharedemail` records | ❌ |
| POST | `/sharedevice/InvitedNewUser` | Create invite record and send invitation email to a non-registered user | Body: `{ email, DeviceId, idSharedUser, AppName, JourneyFlag }` | `{ success, message }` | ✅ JWT |
| GET | `/sharedevice/ChangeSharedNotificationSetting` | Update both `IsSharedUserNotification` and `IsNotification` for a share record | `?id&IsSharedUserNotification&IsNotification&idUser` | `{ success, message }` | ✅ JWT |
| GET | `/sharedevice/ChangeNotificationSetting` | Update `IsNotification` only for a share record | `?id&IsNotification` | `{ success, message }` | ✅ JWT |
| GET | `/sharedevice/RemoveSharedUser` | Delete a share record and notify both parties via Socket.IO | `?id&UserId&DeviceId&idSharedUser` | `{ success, message, data }` | ✅ JWT |
| GET | `/sharedevice/RejectSharedInvitation` | Reject a pending email invitation | `?Id={int}` | `{ success, message, data }` | ✅ JWT |
| POST | `/sharedevice/SaveSharedGroupUserNew` | Share all vehicles in a group with a user | Body: `{ email, idApp, idSharedUser, IdGroup }` | `{ success, message }` | ✅ JWT |
| GET | `/sharedevice/getAllInvitedUser` | Get all invited email records for all vehicles in a group | `?IdGroup&idUser&email` | `{ success, message }` | ✅ JWT |
| POST | `/sharedevice/InvitedNewUserByGroupShare` | Send group invitation emails to a user for all vehicles in a group | Body: `{ email, idSharedUser, IdGroup, AppName }` | `{ success, message }` | ✅ JWT |

---

### `/sim` — SIM Card Management

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/sim/GetSimSerialByDeviceId` | Get SIM serial, device type, app name, and country for a device | `?DeviceId={string}` | Array of `{ SerialNum, DeviceId, Type, AppName, Country }` | ❌ |
| GET | `/sim/GetAllSIMInfo` | Get all SIMs with telco and app info (full list, no pagination) | — | Array of SIM objects | ❌ |
| GET | `/sim/GetAllSIMInfoNew` | Paginated SIM list with status, start/spoil dates, app name (DataTables) | DataTables params | DataTables JSON response | ❌ |
| POST | `/sim/SaveSIMInfo` | Create or update a SIM record | Body: `{ Id, SerialNum, PhoneNum, idTelCo, idApp, Status, ... }` | `{ success, message, data }` | ✅ JWT |
| GET | `/sim/DeleteSIMInfo` | Hard-delete a SIM record | `?Id={int}` | `{ success, message, data }` | ✅ JWT |
| GET | `/sim/DownloadTemplate` | Download a blank XLSX template for bulk SIM import | — | XLSX file download | ❌ |
| POST | `/sim/uploadExcelDevice` | Bulk import SIM records from uploaded Excel/CSV file | Multipart form with Excel file | `{ success, message }` | ❌ |
| GET | `/sim/Export` | Export all SIM records to XLSX | — | XLSX file download | ❌ |
| GET | `/sim/CheckSimDetail` | Check if a SIM serial exists in the system | `?SerialNum={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetFullSimSerialByDeviceId` | Get full SIM detail including status, start/spoil dates, linked device | `?DeviceId={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetFullDeviceBySimSerial` | Get GPS device record linked to a SIM serial | `?SerialNum={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetFullDeviceByVehicle` | Get SIM info linked to a vehicle | `?VehicleId={int}` | `{ success, data }` | ❌ |
| GET | `/sim/GetOrderRenewByDevice` | Get renewal order information for a specific device | `?DeviceId={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetDeviceBySimSerial` | Get device ID associated with a SIM serial | `?SerialNum={string}` | `{ success, data }` | ❌ |
| GET | `/sim/AttachSimMDetail` | Attach a SIM (by serial) to a GPS device (by DeviceId) | `?DeviceId&SerialNum` | `{ success, message }` | ❌ |
| GET | `/sim/GetVehicleDetail` | Get vehicle and GPS device details for a device ID | `?DeviceId={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetExpiryByDeviceID` | Get licence expiry date for a device | `?DeviceId={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetFirstGPSDataByDeviceID` | Get the first ever GPS data record for a device | `?DeviceId={string}` | `{ success, data }` | ❌ |
| GET | `/sim/GetDeviceExpiryBySimSerial` | Get device expiry date via SIM serial lookup | `?SerialNum={string}` | `{ success, data }` | ❌ |
| GET | `/sim/ExportWithSalesAgent` | Export SIM data filtered to records with a sales agent | — | XLSX file download | ❌ |
| GET | `/sim/ExportWithoutSalesAgent` | Export SIM data filtered to records without a sales agent | — | XLSX file download | ❌ |
| GET | `/sim/DetachSimTracker` | Remove SIM association from a GPS device | `?DeviceId={string}` | `{ success, message }` | ❌ |
| GET | `/sim/ExportSimExport` | Export SIM and device details to XLSX | — | XLSX file download | ❌ |
| GET | `/sim/ExportSimMultiDeviceExport` | Export SIMs linked to multiple device types | — | XLSX file download | ❌ |
| GET | `/sim/ExportNoSimNoAppDeviceExport` | Export devices with no SIM or no app assignment | — | XLSX file download | ❌ |
| GET | `/sim/UpdateManualSimStatus` | Manually set a SIM's status field | `?id&Status` | `{ success, message }` | ❌ |
| GET | `/sim/GetExpiredDeviceNoSimTerminate` | List devices with expired licences that have no SIM termination flag | — | Array of device objects | ❌ |
| GET | `/sim/GetExpiredDeviceIn30Days` | List devices expiring within the next 30 days | — | Array of device objects | ❌ |
| GET | `/sim/GetRenewalList` | Paginated renewal-due SIM list (DataTables) | DataTables params | DataTables JSON response | ❌ |
| GET | `/sim/ExportRenewalData` | Export renewal data to XLSX | — | XLSX file download | ❌ |
| GET | `/sim/ExportExpiredDevice` | Export expired device list to XLSX | — | XLSX file download | ❌ |
| GET | `/sim/GetSalesAgentDevice` | Get devices assigned to a specific sales agent | `?idSalesAgent={int}` | Array of device objects | ❌ |
| GET | `/sim/GetTerminatedSim` | Get SIMs with `Status = 'Spoil'` for a given app | `?idApp={int}` | Array of SIM objects | ❌ |
| GET | `/sim/ExportTerminatedSim` | Export terminated SIMs to XLSX | — | XLSX file download | ❌ |
| GET | `/sim/GetTerminatedSimAdmin` | Admin view of all terminated SIMs | — | Array of SIM objects | ❌ |
| GET | `/sim/ExportTerminatedSimAdmin` | Admin export of all terminated SIMs to XLSX | — | XLSX file download | ❌ |

---

### `/simreplace` — SIM Replacement

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| POST | `/simreplace/GetAllSim` | Get list of distinct SIM serial numbers (optionally scoped by app) | Body: `{ idApp }` | `{ success, message, data: [{ SerialNum, CreatedDate }] }` | ❌ |
| GET | `/simreplace/GetAllDyanmicSimReplace` | Paginated history of all SIM replacements (DataTables) | DataTables params | DataTables JSON response | ❌ |
| POST | `/simreplace/SaveSimReplace` | Authenticated SIM swap: replace old SIM with new SIM on a GPS device | Body: `{ OldSim, NewSim }` | `{ success, message }` | ✅ JWT |
| POST | `/simreplace/SaveSimReplaceMDetail` | Unauthenticated SIM swap for automated MDetail system integration | Body: `{ OldSim, NewSim }` | `{ success, message }` | ❌ |

---

### `/SalesAgentDevice` — Sales Agent Device Portal

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/SalesAgentDevice/MobileAppLoginNew` | Sales Agent mobile login — validates role and returns JWT token | `?username&password` | `{ success, token, UserId, UserName, Email, idApp, OrderTotal, message }` | ❌ |
| GET | `/SalesAgentDevice/GetSIMByIMEI` | Look up SIM details currently attached to a GPS device by IMEI | `?IMEI={string}` | `{ success, message, data: SIMObject | null }` | ❌ |
| POST | `/SalesAgentDevice/UpdateDeviceBySalesAgent` | Provision or update a GPS device with SIM and agent association | Body: `{ IMEI, SIM, idApp, UserId }` | `{ success, message, data }` | ✅ JWT |
| GET | `/SalesAgentDevice/GetAllRenewDataForSalesAgent` | Paginated renewal pipeline for the authenticated sales agent (with live GPS date from Redis) | `?page&search&StartDate&EndDate&idApp` | Array of renewal objects with `GpsDate` | ✅ JWT |
| POST | `/SalesAgentDevice/AdminInpersionateLogin` | Super Admin impersonates a Sales Agent account and receives their token | Body: `{ Token, UserId }` | `{ success, token, UserId, UserName, Email, idApp, message }` | ✅ JWT (Super Admin only) |

---

## 6. Database Interactions

### tblsimdetails

**Key fields:** `id` (PK), `SerialNum` (unique SIM serial), `PhoneNum` (MSISDN), `idTelCo` (FK → tbltelco), `idApp` (FK → tblappinfo), `Status` (e.g. `null`, `'Spoil'`), `StartDate`, `SpoilDate`, `CreatedDate`

**Queries performed:**
- `findOrCreate` by `{ SerialNum }` — prevents duplicate SIM registration
- `findOne` by `{ SerialNum }` — duplicate check during update
- `update` by `id` — update SIM details, set `SpoilDate` when Status changes to `'Spoil'`
- `destroy` by `id` — hard delete
- `updateAttributes({ Status: 'Spoil', SpoilDate })` — mark old SIM as spoiled during replacement
- `update({ StartDate, Status: null, SpoilDate: null })` — activate new SIM after replacement
- Raw SQL SELECT with `LEFT JOIN tbltelco`, `LEFT JOIN tblappinfo` — for admin listing
- Bulk insert via uploaded Excel file loop
- `ManageSimFun()` in `SalesAgentDevice.js` resolves or creates a SIM record by serial number for provisioning

### tblsimreplace

**Key fields:** `id` (PK), `OldSim`, `NewSim`, `CreatedBy`, `CreatedDate`, `idApp`

**Queries performed:**
- `create` — records each SIM replacement event
- Raw SQL SELECT with search on `OldSim`, `NewSim`, `idApp`, `CreatedBy`, `CreatedDate` — paginated DataTables list

### tblgpsdevice

**Key fields:** `id` (PK), `DeviceId` (tracker ID), `IMEI`, `idSim` (FK → tblsimdetails), `SimNum`, `AppName`, `idSalesAgent`, `Type`, `CountryId`, `ExpiryDate`, `IsActive`, `CreatedDate`, `CreatedBy`

**Queries performed:**
- `findOne` by `{ idSim }` — check if a SIM is already assigned to another device
- `findOne` by `{ IMEI }` — look up device for provisioning
- `findOne` by `{ DeviceId }` — look up by tracker ID
- `updateAttributes({ idSim, SimNum, idSalesAgent, AppName })` — update after SIM assignment
- `updateAttributes({ idSim: null })` — clear SIM during conflict resolution
- `findOrCreate` by `{ IMEI }` — create new device record if not present
- Raw SQL LEFT JOIN `tbldeviceaccvalueset` — for ACC value admin listing

### tblsharedevice

**Key fields:** `id` (PK), `idUser` (owner FK), `idSharedUser` (recipient FK), `DeviceId`, `idVehicle` (FK → tblvehicle), `IsActive`, `IsSharedUserNotification`, `IsNotification`, `IdSharedGroup`, `JourneyFlag`, `CreatedBy`, `CreatedDate`

**Queries performed:**
- `findOne` by `{ DeviceId, idUser, idSharedUser }` — duplicate share check
- `create` — new share record
- `destroy` by `id` — remove share
- `findAll` with `User` include, WHERE `{ DeviceId, $or: [{ idSharedUser }, { idUser }] }` — get sharing list for a device
- Raw SQL `UPDATE tblsharedevice SET IsSharedUserNotification=X, IsNotification=Y WHERE id=Z` — notification preference update
- Batch `INSERT INTO tblsharedevice (idUser, idSharedUser, IsActive, idVehicle, CreatedBy, CreatedDate, DeviceId, IsSharedUserNotification, IsNotification) VALUES ?` — group share
- Raw SQL SELECT with JOINs to `tbluserinformation`, `tblvehicle`, `tblappinfo` — admin shared user listing

### tblsharedemail

**Key fields:** `Id` (PK), `DeviceId`, `SharedEmail` (invitee email), `Status` (`'Pending'`, `'Complete'`, `'Rejected By Main User'`), `idUser` (inviter), `JourneyFlag`, `CreatedBy`, `CreatedDate`, `ModifiedBy`, `ModifiedDate`

**Queries performed:**
- `findOrCreate` by `{ DeviceId, SharedEmail }` — prevent duplicate invitation
- `updateAttributes({ Status, ModifiedBy, ModifiedDate, JourneyFlag })` — reject or re-invite
- `findAll` by `{ DeviceId }` — list all invitations for a device
- `findAll` by `{ idUser, DeviceId, Status: 'Pending' }` — check for open invitations

### tbldeviceagentretailer

**Key fields:** `id` (PK), `deviceId` (GPS device ID, derived from `IMEI.slice(1)`), `agentId` (FK → tbluserinformation), `activatedDatetime`, `createdDatetime`

**Queries performed:**
- `findOne` by `{ deviceId }` — check if agent–device link exists
- `create` — record new agent–device association
- `updateAttributes({ agentId })` — update agent ownership

### tbldeviceaccvalueset

**Key fields:** `id` (PK), `DeviceId`, `IsACCValueSet`, `CreatedDate`

**Queries performed:**
- Raw SQL SELECT `tbldeviceaccvalueset.*, tblgpsdevice.AppName` with LEFT JOIN on `DeviceId` — paginated ACC value listing
- Separate COUNT query for DataTables pagination

### Redis Cache

- `client.get(DeviceId)` — fetch live GPS packet in `GetAllRenewDataForSalesAgent` (returns `GpsDate` from `objgps.Date`)
- `Commonfunction.UpdateVehicleRedis(DeviceId, 'PushNotification')` — refresh push subscriber list after share creation/deletion
- Redis unavailability results in `GpsDate = null` for renewal list items (non-blocking)

### tblemailtemplate / tblemailsettingsys

- `EmailTemplate.findOne({ where: { Type: "Invitation Email" } })` — fetch invitation email template
- `SystemEmail.findOne({ where: { IdApp: AppInfoExit.Id } })` — fetch SMTP configuration per app
- Template body variables: `{AppName}`, `{email}`, `{url}` replaced via `String.replace()`

---

## 7. Edge Cases & Error Handling

### SIM Management

| Scenario | Behaviour |
|---|---|
| `SaveSIMInfo` with duplicate `SerialNum` on create | `findOrCreate` returns existing record; response: `{ success: false, message: "SIM Info is already Exist..." }` |
| `SaveSIMInfo` update with `SerialNum` already used by a different SIM | Blocked; returns `{ success: false, message: "SIM Info is already Exist..." }` |
| `SaveSIMInfo` with `Status = 'Spoil'` (create path) | Bug: `new Data()` (not `new Date()`) will throw a ReferenceError at runtime when Status is 'Spoil' on create |
| `DeleteSIMInfo` with empty `Id` | Returns `{ success: false, message: "Select SIm To delete" }` (typo in source: "SIm" should be "SIM") |
| `DeleteSIMInfo` when SIM does not exist | `destroy` returns 0 rows; response: `RecordNotFound` global constant |
| `GetAllSIMInfo` query returns `undefined` | Returns an empty object `{}` (not an array) — callers should handle both array and object |

### SIM Replacement

| Scenario | Behaviour |
|---|---|
| Old SIM serial not found in `tblsimdetails` | Returns `{ success: false, message: "Old SIM not exist..." }` |
| New SIM serial not found in `tblsimdetails` | Returns `{ success: false, message: "New SIM not exist..." }` |
| Old SIM not currently linked to any GPS device | Returns `{ success: false, message: "Old SIM not exist in Gps Device..." }` |
| `SimReplace.create` fails | Returns `{ success: false, message: "SIM not replace successfully..." }` |
| Old GPS device `updateAttributes` fails | Returns `{ success: false, message: "Old SIM not updated..." }` |
| `SimDetail.findOne` for old SIM returns null after device update | Still returns `{ success: true, message: "New SIM replace successfully..." }` (graceful bypass) |
| Vehicle lookup for old device fails | Not fatal; `SimDetail.update` for new SIM still proceeds |
| `SaveSimReplaceMDetail` — no JWT required | No authentication; `CreatedBy` is hardcoded to `'MDetail'`; intended for machine-to-machine use |

### Device Sharing

| Scenario | Behaviour |
|---|---|
| `SaveSharedUserNew` with email not found in app | Returns `{ success: false, message: "User is not Exist..." }` |
| Duplicate share record | Returns `{ success: false, message: "Vehicle is already Shared With This User..." }` |
| `RemoveSharedUser` with non-existent share record | Returns `RecordNotFound` |
| `InvitedNewUser` — email template not found | Returns `{ success: false, message: "Email Template not found" }` |
| `InvitedNewUser` — invitation already sent and pending | Returns `{ success: true, message: "You have already invited this user" }` (note: `success: true` even for the no-op case) |
| `InvitedNewUser` — prior invitation in non-pending/complete state | Resets to `'Pending'` and re-sends email |
| `SaveSharedGroupUserNew` — all vehicles already shared | Returns `{ success: true, message: "Group of vehicle already shared this user." }` |
| `SaveSharedGroupUserNew` — group has no vehicles | Returns `{ success: false, message: "Group has no vehicle found." }` |
| Socket.IO emit failure | Not caught; fire-and-forget; client will update on next poll if socket delivery fails |
| `ChangeNotificationSetting` — SQL update fails | Returns `{ success: false, message: 'Notification Setting could not Changed. Try again later.' }` |

### Sales Agent Provisioning

| Scenario | Behaviour |
|---|---|
| Login with invalid credentials | Returns `{ success: false, message: "Invalid Username or Password..." }` |
| Login for user without `'Sales Agent'` role | Sequelize include with `where: { RoleName: 'Sales Agent' }` returns null; treated as invalid credentials |
| `UpdateDeviceBySalesAgent` — app ID not found | Returns `"Tacker Invalid.."` (note: misspelling of "Tracker" in source) |
| SIM already assigned to a different device | Returns `{ success: false, message: "SIM Is Already assigned." }` |
| `UpdateDeviceBySalesAgent` — GPS device update fails | Returns `{ success: false, message: "Tacker Not Updated." }` |
| `GetAllRenewDataForSalesAgent` — invalid/missing JWT | Returns `[]` (empty array, not an error object) |
| Redis unavailable during renewal list build | `GpsDate` is set to `null` for affected items; list is still returned |
| `AdminInpersionateLogin` — JWT decode throws exception | `try/catch` returns `InvalidToken` |
| `AdminInpersionateLogin` — caller is not Super Admin | Returns `InvalidToken` |
| `AdminInpersionateLogin` — target user lacks Sales Agent role | Returns `{ success: false, message: "Invalid Username or Password..." }` |

### Device ACC Values

| Scenario | Behaviour |
|---|---|
| `GetAllDeviceAccValue` — `connection.query` returns `undefined` | Returns `{ draw, recordsTotal: 0, recordsFiltered: 0, data: [] }` |
| EndDate with no StartDate | Uses `response.StartDate` instead of `response.EndDate` in WHERE clause — this is a bug in the current source code |

### Audit Logging

All authenticated mutating operations call `funAuditLog.CreateAuditLog(action, username, description)`. Key logged events include:
- `'Share Device'` — records owner ID, recipient ID, and device ID
- `'DeleteSharedUser'` — records deleted share context
- `'RejectSharedInvitation'` — records the invitee email and rejector
- `'ChangeMainShareNotification'` / `'ChangeSubShareNotification'` — notification preference changes
- `'Create shared Email'` / `'Update shared Email'` — invitation lifecycle
- `'Save SIM'` / `'Update SIM'` / `'DeleteSIM'` — SIM CRUD events
- `'Tracker Update'` — records the sales agent username and IMEI for device provisioning
