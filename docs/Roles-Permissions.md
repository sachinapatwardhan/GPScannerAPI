# Roles & Permissions

## Table of Contents
1. [Module Purpose](#1-module-purpose)
2. [Business Workflow (Step-by-Step)](#2-business-workflow-step-by-step)
3. [Actor Interactions](#3-actor-interactions)
4. [Validation Rules](#4-validation-rules)
5. [API Endpoints](#5-api-endpoints)
6. [Database Interactions](#6-database-interactions)
7. [Edge Cases & Error Handling](#7-edge-cases--error-handling)

---

## 1. Module Purpose

The Roles & Permissions module is the access-control backbone of the Maark / GPScannerAPI platform. It provides a **role-based access control (RBAC)** system where:

- **Modules** represent distinct functional areas of the application (e.g., a fleet screen, a report page, a settings panel). Each module is a named unit that can be shown or hidden and is assigned a display order.
- **Roles** are named groupings (e.g., *Admin*, *Dispatcher*, *Driver*) that aggregate a set of permissions across modules.
- **User Permissions** are per-role, per-module records that define exactly which of the four CRUD operations—`Show`, `Added`, `Modified`, `Deleted`—a role is allowed to perform on that module.

Together these three entities let administrators define fine-grained access policies and enforce them on every mutating API call through the `CheckUserAccessPermission` helper, which is invoked before any create, update, or delete operation elsewhere in the system.

### Controllers involved

| Controller file | Route prefix | Responsibility |
|---|---|---|
| `controllers/role.js` | `/role` | CRUD management of roles (`tblrole`) |
| `controllers/userPermission.js` | `/userpermission` | CRUD management of per-role module permissions (`tbluserpermission`); runtime rights-check helpers |
| `controllers/module.js` | `/module` | CRUD management of application modules (`tblmodulemgmt`) |

---

## 2. Business Workflow (Step-by-Step)

### 2.1 Creating a Module

1. An authenticated administrator calls `POST /module/CreateModule` with a module name.
2. The system verifies the JWT token and confirms the user exists in `tbluserinformation`.
3. `findOrCreate` is executed against `tblmodulemgmt` on the `Module` (name) field. If a module with that name already exists the request is rejected.
4. On success an audit-log entry `'Create Module'` is written.

### 2.2 Creating a Role

1. An authenticated user calls `POST /role/SaveRole` with `id: 0` in the body (signals a new record).
2. The system verifies the JWT, then calls `CheckUserAccessPermission` with `permission = "Added"` and `tablename` taken from the `x-requested-with` header. This confirms the calling user's role has `Added = true` for the relevant module before allowing the operation.
3. `findOrCreate` is executed against `tblrole` on the `RoleName` field. Duplicate names are rejected.
4. On success an audit-log entry `'Create Role'` is written.

### 2.3 Updating a Role

1. The same `POST /role/SaveRole` endpoint is used but with `id != 0`.
2. After the permission check (`permission = "Modified"`), the system first checks whether any *other* role already carries the new `RoleName` to prevent duplicate names.
3. If no conflict, `Role.update()` is executed and an audit-log entry `'Update Role'` is written.

### 2.4 Deleting a Role

1. `GET /role/DeleteRole?idRole=<id>` is called.
2. The `CheckUserAccessPermission` check runs first (`permission = "Deleted"`).
3. The system then queries `tbluserinrole` to verify no user is currently assigned to this role. If any assignment exists the deletion is blocked with a `NotDeleteReferenceData` response.
4. If the role is unassigned, `Role.destroy()` is executed and `'Delete Role'` is logged.

### 2.5 Granting / Revoking a Single Permission

1. `POST /userpermission/ChangePermission` is called with `{ idModule, RoleName, Added, Modified, Deleted, Show }`.
2. The system verifies the JWT.
3. An existing permission record is located by `{ idModule, RoleName }`. If found it is **updated**; if not found a new record is **created**.
4. An audit-log entry `'Update User Permission'` or `'Create User Permission'` is written accordingly.

### 2.6 Bulk Permission Change (entire permission type across all modules)

1. `POST /userpermission/ChangeAllPermissions` is called with `{ Type, Show, RoleName, Data: [...] }` where `Data` is an array of module objects.
2. The `Type` field selects which boolean column is being bulk-toggled: `"View"` → `Show`, `"Add"` → `Added`, `"Update"` → `Modified`, any other value → `Deleted`.
3. The system iterates over every module entry in `Data` with a recursive `uploader(i)` function:
   - For each module it finds or creates the permission record, then applies only the targeted boolean column.
4. After all modules are processed, a single audit-log entry is written.

### 2.7 Runtime Rights Check (single operation)

1. Any protected controller calls `GET /userpermission/CheckRights?tablename=<module>&permission=<type>` (internally via `CheckUserAccessPermission`) or an external client calls it directly.
2. The JWT is decoded to get `username` + `password`. Optionally `idApp` is also matched.
3. The module is looked up by name in `tblmodulemgmt`.
4. All roles assigned to the user (`tbluserinrole`) are iterated. For each role the corresponding `tbluserpermission` record is queried and the relevant boolean (`Added`, `Show`, `Modified`, `Deleted`) is checked. The first role that grants the permission short-circuits the loop and returns `success: true`.
5. If no role grants access, `success: false` is returned.

### 2.8 Loading All Page Rights (navigation/menu)

1. `GET /userpermission/GetAllPageRights` is called (typically on login or page load).
2. All roles for the user are collected, then all `tbluserpermission` rows where `Show = true` and `RoleName IN (user's roles)` are returned joined with module metadata (`DisplayOrder`, `Module` name).
3. The client uses this list to build the navigation menu, showing only the modules the user may view.

### 2.9 Loading Per-Page CRUD Flags

1. `GET /userpermission/CheckRightsbyPage?tablename=<module>` is called when a page loads.
2. All permission rows for the user's roles on that specific module are aggregated — any role granting `Added`, `Deleted`, `Modified`, or `Show` causes that flag to be set `true` in the aggregate result.
3. The client uses the returned `{ Added, Deleted, Modified, Show }` object to show or hide action buttons on the page.

---

## 3. Actor Interactions

| Actor | Can manage Modules | Can manage Roles | Can manage Permissions | Notes |
|---|---|---|---|---|
| **Authenticated admin user** | ✅ Create / Update / Delete | ✅ Create / Update / Delete | ✅ Change / Bulk-change | Must hold the `Added` / `Modified` / `Deleted` permission for the relevant module (enforced via `CheckUserAccessPermission` on role operations) |
| **Authenticated standard user** | ❌ | ❌ | ❌ | May only query their own rights via `CheckRights`, `GetAllPageRights`, `CheckRightsbyPage` |
| **Unauthenticated / invalid token** | ❌ | ❌ | ❌ | All endpoints return `InvalidToken` immediately |

> **Note:** Module management endpoints (`CreateModule`, `UpdateModule`, `DeleteModule`) do **not** call `CheckUserAccessPermission`; they only require a valid JWT with a matching user record. Role management and rights-check endpoints do enforce per-module RBAC.

---

## 4. Validation Rules

### Roles (`tblrole`)

| Field | Type | Constraints | Enforcement point |
|---|---|---|---|
| `id` | INTEGER(11) | Primary key, auto-increment, NOT NULL | Database |
| `RoleName` | STRING | NOT NULL; must be unique | `findOrCreate` (create path); explicit duplicate-name check (update path) |
| `Description` | STRING | Optional (nullable) | Database allows NULL |
| `Country` | TEXT | Optional (nullable) | Database allows NULL |
| `id == 0` in request body | — | Triggers **create** path | Controller logic |
| `id != 0` in request body | — | Triggers **update** path; duplicate-name check against other records | Controller logic |

### Modules (`tblmodulemgmt`)

| Field | Type | Constraints | Enforcement point |
|---|---|---|---|
| `id` | INTEGER(11) | Primary key, auto-increment, NOT NULL | Database |
| `Module` | STRING | Unique (enforced via `findOrCreate`) | Controller `findOrCreate` |
| `IsActive` | BOOLEAN | NOT NULL | Database |
| `DisplayOrder` | INTEGER(11) | Optional; defaults to `0` | Database default |

### User Permissions (`tbluserpermission`)

| Field | Type | Constraints | Enforcement point |
|---|---|---|---|
| `id` | INTEGER(11) | Primary key, auto-increment, NOT NULL | Database |
| `idModule` | INTEGER(11) | NOT NULL; FK → `tblmodulemgmt.id` | Database foreign key |
| `RoleName` | STRING | NOT NULL | Database |
| `Added` | BOOLEAN | Optional; defaults to `false` (`'0'`) | Database default |
| `Modified` | BOOLEAN | Optional; defaults to `false` (`'0'`) | Database default |
| `Deleted` | BOOLEAN | Optional; defaults to `false` (`'0'`) | Database default |
| `Show` | BOOLEAN | Optional (nullable, no default) | Database |

### `ChangeAllPermissions` request body

| Field | Allowed values | Effect |
|---|---|---|
| `Type` | `"View"` | Sets `Show` column |
| `Type` | `"Add"` | Sets `Added` column |
| `Type` | `"Update"` | Sets `Modified` column |
| `Type` | anything else | Sets `Deleted` column |
| `Show` | `true` / `false` | The boolean value to write |
| `RoleName` | string | Role to update permissions for |
| `Data` | array of `{ idModule }` objects | Modules to iterate over |

### JWT / Authentication

- All endpoints extract the token via `getToken(req.headers)`. If no token is present `InvalidToken` is returned immediately.
- The decoded token must contain `username` + `password` that match a row in `tbluserinformation`.
- Optionally `idApp` (a query parameter) is also matched against the user record when present.

---

## 5. API Endpoints

### Role endpoints — prefix `/role`

| Method | Endpoint | Description | Request Params / Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/role/GetAllRole` | Retrieve all roles | — | Array of `tblrole` objects | No (no token check in code) |
| GET | `/role/GetRoleById` | Retrieve a single role by ID | Query: `idRole` | `{ success, message, data }` | No |
| POST | `/role/SaveRole` | Create or update a role | Body: `{ id, RoleName, Description, Country }`. Header: `x-requested-with` = module name. `id=0` → create; `id!=0` → update | `{ success, message, data }` | Yes — JWT + `Added`/`Modified` permission check |
| GET | `/role/DeleteRole` | Delete a role | Query: `idRole`. Header: `x-requested-with` = module name | `{ success, message, data }` | Yes — JWT + `Deleted` permission check |

### User Permission endpoints — prefix `/userpermission`

| Method | Endpoint | Description | Request Params / Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/userpermission/GetAllPermissionByRole` | Get all permissions for a role, joined with module info | Query: `RoleName` | Array of `tbluserpermission` joined with `tblmodulemgmt` | No |
| POST | `/userpermission/ChangePermission` | Create or update a single permission record | Body: `{ idModule, RoleName, Added, Modified, Deleted, Show }` | `{ success, message, data }` | Yes — JWT |
| POST | `/userpermission/ChangeAllPermissions` | Bulk toggle one permission type across multiple modules | Body: `{ Type, Show, RoleName, Data: [{ idModule }] }` | `{ success, message }` | Yes — JWT |
| GET | `/userpermission/CheckRights` | Check if the current user has a specific permission on a module | Query: `tablename`, `permission` (`Added`/`Show`/`Modified`/`Deleted`), optional `idApp` | `{ success, message, order? }` | Yes — JWT |
| GET | `/userpermission/GetAllPageRights` | Get all modules the current user may view (for navigation menu) | Query: optional `idApp` | `{ success, message, data: [tbluserpermission + module] }` | Yes — JWT |
| GET | `/userpermission/CheckRightsbyPage` | Get the aggregated CRUD flags for the current user on a specific module | Query: `tablename`, optional `idApp` | `{ success, message, data: { Added?, Deleted?, Modified?, Show? } }` | Yes — JWT |

### Module endpoints — prefix `/module`

| Method | Endpoint | Description | Request Params / Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/module/GetAllModule` | Retrieve all active modules (`IsActive = true`) | — | Array of `tblmodulemgmt` | No |
| GET | `/module/GetAllModuleName` | Retrieve all modules regardless of active status | — | Array of `tblmodulemgmt` | No |
| GET | `/module/GetModuleById/:idModule` | Retrieve a single module by ID | Path param: `idModule` | `tblmodulemgmt` object or `{ success: false, message }` | No |
| POST | `/module/CreateModule` | Create a new module | Body: `{ Module, IsActive, DisplayOrder }` | `{ success, message }` | Yes — JWT |
| POST | `/module/UpdateModule` | Update an existing module | Body: `{ id, Module, IsActive, DisplayOrder }` | `{ success, message }` | Yes — JWT |
| GET | `/module/DeleteModule/:idModule` | Delete a module **only if** no permission records reference it | Path param: `idModule` | `{ success, message }` | Yes — JWT |
| GET | `/module/DeleteModuleAndpermission/:idModule` | Delete a module **and** all its associated permission records | Path param: `idModule` | `{ success, message }` | Yes — JWT |

---

## 6. Database Interactions

### Models used

| Sequelize model | Table | Description |
|---|---|---|
| `tblrole` | `tblrole` | Stores role definitions |
| `tbluserpermission` | `tbluserpermission` | Stores per-role, per-module permission flags |
| `tblmodulemgmt` | `tblmodulemgmt` | Stores application module definitions |
| `tbluserinformation` | `tbluserinformation` | Used for JWT validation (username + password lookup) |
| `tbluserinrole` | `tbluserinrole` | Used to resolve which roles a user belongs to; also used to guard role deletion |

### Key queries

#### `tblrole`

| Operation | Query | Trigger |
|---|---|---|
| List all | `Role.findAll()` | `GET /role/GetAllRole` |
| Find by ID | `Role.findOne({ where: { id } })` | `GET /role/GetRoleById` |
| Create (deduplicated) | `Role.findOrCreate({ where: { RoleName }, defaults: body })` | `POST /role/SaveRole` with `id=0` |
| Update | `Role.update(body, { where: { id } })` | `POST /role/SaveRole` with `id!=0` |
| Delete | `Role.destroy({ where: { id } })` | `GET /role/DeleteRole` |

#### `tblmodulemgmt`

| Operation | Query | Trigger |
|---|---|---|
| List active | `Module.findAll({ where: { IsActive: true } })` | `GET /module/GetAllModule` |
| List all | `Module.findAll()` | `GET /module/GetAllModuleName` |
| Find by ID | `Module.findOne({ where: { id } })` | `GET /module/GetModuleById/:id` |
| Find by name | `Module.findOne({ where: { Module: name } })` | `CheckRights`, `CheckRightsbyPage` |
| Create (deduplicated) | `Module.findOrCreate({ where: { Module }, defaults: body })` | `POST /module/CreateModule` |
| Update | `Module.update(body, { where: { id } })` | `POST /module/UpdateModule` |
| Delete | `Module.destroy({ where: { id } })` | `GET /module/DeleteModule/:id`, `GET /module/DeleteModuleAndpermission/:id` |

#### `tbluserpermission`

| Operation | Query | Trigger |
|---|---|---|
| Find all by role (with module join) | `UserPermission.findAll({ where: { RoleName }, include: [Module] })` | `GET /userpermission/GetAllPermissionByRole` |
| Find by `idModule` + `RoleName` | `UserPermission.findOne({ where: { idModule, RoleName } })` | `ChangePermission`, `ChangeAllPermissions` |
| Create | `UserPermission.create(obj)` | `ChangePermission` (new record), `ChangeAllPermissions` (new record) |
| Update | `UserPermission.update(body, { where: { id, idModule } })` | `ChangePermission` (existing record) |
| Bulk attribute update | `objUserPermissionExist.updateAttributes(objPermission)` | `ChangeAllPermissions` (existing record) |
| Find all visible (with module join) | `UserPermission.findAll({ where: { Show: true, RoleName: { $in: roles } }, include: [Module] })` | `GetAllPageRights` |
| Find all for page | `UserPermission.findAll({ where: { idModule, RoleName: { $in: roles } } })` | `CheckRightsbyPage` |
| Referential guard | `UserPermission.findOne({ where: { idModule } })` | `DELETE /module/DeleteModule/:id` (blocks deletion) |
| Cascade delete | `UserPermission.destroy({ where: { idModule } })` | `GET /module/DeleteModuleAndpermission/:id` |

#### `tbluserinrole`

| Operation | Query | Trigger |
|---|---|---|
| Guard role deletion | `UserInRole.findOne({ where: { roleId } })` | `GET /role/DeleteRole` |
| Find roles for user (with role join) | `UserInRole.findAll({ where: { userId }, include: [Role] })` | `CheckRights`, `GetAllPageRights`, `CheckRightsbyPage` |

### Associations declared at runtime

The following Sequelize `belongsTo` associations are declared inside route handlers (rather than in the model files):

| Association | Where declared |
|---|---|
| `UserPermission.belongsTo(Module, { foreignKey: 'idModule' })` | `GetAllPermissionByRole`, `GetAllPageRights` |
| `UserInRole.belongsTo(Role, { foreignKey: 'roleId' })` | `CheckRights`, `GetAllPageRights`, `CheckRightsbyPage` |

---

## 7. Edge Cases & Error Handling

### Common error response constants

| Constant | Meaning | HTTP body |
|---|---|---|
| `InvalidToken` | JWT absent, invalid, or user not found in DB | `{ success: false, message: "..." }` (constant defined globally) |
| `NoAccessPermission` | `CheckUserAccessPermission` returned `success: false` | `{ success: false, message: "..." }` (constant defined globally) |
| `NotDeleteReferenceData` | Attempted deletion of a record referenced elsewhere | `{ success: false, message: "..." }` (constant defined globally) |

### Role controller

| Scenario | Behaviour |
|---|---|
| `SaveRole` with `id=0` and `RoleName` already exists | `{ success: false, message: "Role is already Exist..." }` — `findOrCreate` returns `created = false` |
| `SaveRole` with `id!=0` and the new `RoleName` is used by a *different* role | `{ success: false, message: "Role is already Exist...", data: existingRole }` |
| `SaveRole` — missing or invalid JWT | `{ ...InvalidToken }` returned before any DB access |
| `SaveRole` — caller lacks `Added`/`Modified` permission | `{ ...NoAccessPermission }` |
| `DeleteRole` — role is still assigned to at least one user (`tbluserinrole` row exists) | `{ ...NotDeleteReferenceData }` — deletion blocked |
| `DeleteRole` — `idRole` does not match any row | `{ success: false, message: "Requested Record not Exist...." }` |
| `GetRoleById` — `idRole` not found | `{ success: false, message: "Record not found...", data: null }` |

### Module controller

| Scenario | Behaviour |
|---|---|
| `CreateModule` — `Module` name already exists | `{ success: false, message: "Module is already Exist..." }` |
| `UpdateModule` — `id` not found | `{ success: false, message: "Module not Found..." }` (`update` returns `[0]`) |
| `DeleteModule` — a `tbluserpermission` row references this module | `{ success: false }` — deletion blocked (no message returned) |
| `DeleteModule` — `idModule` not found | `{ success: false, message: "Requested Module not Exist..." }` |
| `DeleteModuleAndpermission` — always deletes permission rows first, then deletes the module; no referential block | If module row not found: `{ success: false, message: "Requested Module not Exist..." }` |
| `GetModuleById` — not found | `{ success: false, message: "Module not found..." }` |

### User Permission controller

| Scenario | Behaviour |
|---|---|
| `ChangePermission` — no existing record for `{ idModule, RoleName }` | Record is **created** (upsert semantics) |
| `ChangePermission` — existing record found | Record is **updated** in place |
| `ChangeAllPermissions` — `Type` is not `"View"`, `"Add"`, or `"Update"` | Falls through to `Deleted` column (implicit default) |
| `CheckRights` — `tablename` module not found in `tblmodulemgmt` | `{ success: false, message: "No Permission to Access...", data: "" }` |
| `CheckRights` — user has no roles assigned (`tbluserinrole` empty) | `{ success: false, message: "No Permission to Access...", data: "" }` |
| `CheckRights` — no role grants the requested permission after all roles checked | `{ success: false, message: "No Permission to Access...", data: "" }` |
| `CheckRights` — unrecognised `permission` value (not `Added`/`Show`/`Modified`/`Deleted`) | Falls to next role iteration; ultimately returns `success: false` |
| `GetAllPageRights` — user has no roles | `{ success: false, message: "No Permission to Access...", data: [] }` |
| `GetAllPageRights` — no visible modules found | `{ success: false, message: "No Permission to Access...", data: [] }` |
| `CheckRightsbyPage` — module name not found | `{ success: false, message: "No Permission to Access...", data: null }` |
| `CheckRightsbyPage` — user has no roles | `{ success: false, message: "No Permission to Access...", data: null }` |
| Any endpoint — missing JWT | `{ ...InvalidToken }` |
| Any endpoint — JWT present but user not in DB | `{ ...InvalidToken }` |
