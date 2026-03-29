# Vehicle & Fleet Management

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

The Vehicle & Fleet Management module is the core operational layer of the Maark GPS tracking platform. It covers the full lifecycle of a tracked asset — from initial vehicle registration and GPS device assignment through real-time location tracking, fleet grouping, vehicle typing, fuel calibration, and CAN bus diagnostics.

**Controllers involved:**

| Controller File | Route Prefix | Responsibility |
|---|---|---|
| `controllers/vehicles.js` | `/vehicles` | Master vehicle CRUD, group management, licence assignment, device transfer, export |
| `controllers/vehiclegroup.js` | `/vehiclegroup` | Admin-facing vehicle group cross-reference views |
| `controllers/vehicletype.js` | `/vehicletype` | Vehicle type definitions (e.g. Car, Truck, Bike) with map icons |
| `controllers/bike.js` | `/bike` | Mobile & web app vehicle data APIs with Redis live-data merge |
| `controllers/fuelcalibration.js` | `/fuelCalibration` | Fuel tank calibration via AD1 analog sensor |
| `controllers/canbusdata.js` | `/canbusdata` | OBD/CAN bus telemetry data browsing and export |

**Models used:** `tblvehicle`, `tblvehiclegroup`, `tblvehicletype`, `tbluserinformation`, `tblgpsdevice`, `tblsimdetails`, `tblgpsdata`, `tbldrivingdata`, `tblalarm`, `tblfence`, `tbldefaultvalue`, `tbllicencemanager`, `tblappinfo`, `tblsharedevice`, `tblcanbusdata`

---

## 2. Business Workflow (Step-by-Step)

### 2.1 Vehicle Registration Flow

1. **Create Vehicle Type** — An administrator calls `POST /vehicletype/SaveVehicleType` to define a vehicle category (e.g. "Car", "Truck"). A unique `Type` name per `idApp` is enforced.
2. **Upload Vehicle Type Icons** — `POST /vehicletype/uploadFile` attaches eight icon variants (`OnIcon`, `OffIcon`, `ActiveIcon`, `PowerCuttIcon`, `LocateOnIcon`, `LocateOffIcon`, `LocateActiveIcon`, `LocatePowerCuttIcon`) to the vehicle type for map rendering.
3. **Register Vehicle** — `POST /vehicles/SaveVehicle` creates a new record in `tblvehicle` keyed on `deviceid`. On creation, `CreatedDate` and `CreatedBy` are stamped; on update, `ModifiedDate` and `ModifiedBy` are set.
4. **Redis Cache Update** — Immediately after any vehicle save or update, `Commonfunction.UpdateVehicleRedis(deviceid, 'Vehicle')` refreshes the live-tracking cache so that all downstream consumers see the latest configuration.
5. **Assign Licence** — `GET /vehicles/AssignLicenceToExistVehicle` scans vehicles with a non-null `renewaldate` that are not yet in `tbllicencemanager`, finds the next available unassigned licence for the app, and links it with the vehicle's `deviceid` and expiry date.

### 2.2 Fleet Group Management Flow

1. **Create Group** — `POST /vehicles/SaveVehicleGroup` (in `vehicles.js`) creates a new `tblvehiclegroup` row, checking that `GroupName` is unique per `IdUser`.
2. **Add Vehicles to Group** — `GET /vehicles/AddVehicleToGroup` bulk-updates `tblvehicle.IdGroup` and `tblsharedevice.IdSharedGroup` for a provided list of device IDs in a single SQL `UPDATE ... WHERE deviceid IN (...)` statement. Redis is refreshed for each device.
3. **View Group Members** — `GET /vehiclegroup/GetvehicleGroupWise` returns a DataTables-compatible paginated list of all vehicles, joined to their group, owner user, and application name.
4. **Rename Group** — `GET /vehicles/updateVehicleGroupName` updates the `GroupName` field.
5. **Delete Group** — `GET /vehicles/GroupRemoveById` nullifies `IdGroup` on all member vehicles and `IdSharedGroup` on all shared devices, then destroys the `tblvehiclegroup` record.
6. **Remove Single Vehicle from Group** — `GET /vehiclegroup/DeleteVehicleGroup` sets `tblvehicle.IdGroup = null` for the specified vehicle ID.

### 2.3 Live Tracking & Mobile App Flow

1. **App Start** — Mobile app calls `POST /bike/GetAllWorkingBike` with a `userId`. The server queries the database for all owned and shared vehicles, then for each device ID issues a `Redis GET` to obtain the live GPS packet.
2. **GPS Data Merge** — Each vehicle row from MySQL is augmented with real-time fields: `IsEngine`, `Latitude`, `Longitude`, `Datetime`, `Date`, `Speed`, `Direction`, `OdoMeter`, `AD1`, `AD2`, `IsWiringForAntiTamper`.
3. **Web App Dashboard** — `GET /bike/GetAllWorkingBikeWebApp` follows the same pattern but additionally provides `FuelRatio`, `FuelCapacity`, `IsFule`, `NotificationCount`, `AlertCount`, `IdGroup`, `IdSharedGroup`, `JourneyFlag`, and the timezone-converted `ExpiryDate`.
4. **Single Vehicle Location** — `GET /vehicles/GetVehicleCurrentLocation` performs a direct Redis `GET` for the requested `DeviceId`, returning the stored GPS JSON immediately.

### 2.4 Fuel Calibration Flow

1. **Read Current Sensor** — `GET /fuelCalibration/SetfullfuelPoint` retrieves the live Redis record for a device and returns the raw `AD1` hex value (parsed to integer) alongside the `GPSDate`. This reading is taken when the tank is confirmed full.
2. **Set Calibration** — `GET /fuelCalibration/SetVehicleFuelData` accepts the known full-tank `fullfuelpoint` (from step 1) and the physical `fueltanksize` in litres. It computes:
   - `FuelRatio = (fullfuelpoint - 40) / fueltanksize`
   - `FuelCapacity = fueltanksize`
   - Sets `IsFule = true` on the vehicle record.
3. These values are later used by the reporting engine to convert raw AD1 readings into litre values.

### 2.5 CAN Bus Data Review Flow

1. **Filter & Browse** — `GET /canbusdata/GetAllCanbusData` accepts a `DeviceId`, `StartDate`, `EndDate`, and DataTables pagination parameters. It queries `tblcanbusdata` joined to `tblvehicle` and `tbluserinformation`, filtering by `idApp`.
2. **Export** — `GET /canbusdata/ExportAllCanbusData` runs the same query (all rows, no LIMIT) and streams an XLSX file with 18 OBD columns.

### 2.6 Vehicle Deletion Flow

1. **Soft Delete** — `GET /vehicles/DeleteVehicle` sets `IsDelete = true` on the record (never hard-deletes).
2. **Redis Purge** — `Commonfunction.DeleteVehicleRedis(deviceid)` is called immediately to remove the device from the live cache.
3. All subsequent listing queries filter on `IsDelete = 0`.

### 2.7 Device Transfer Flow

1. **Find Free Devices** — `GET /vehicles/GetAllNotAssignDevice` returns GPS devices in `tblgpsdevice` whose `DeviceId` is not present in any `tblvehicle` row.
2. **Transfer** — `GET /vehicles/TransferDevicetoUser` updates `tblvehicle.deviceid` and simultaneously updates any geo-fence records (`tblfence.deviceId`) for the same vehicle, and resets `MaxSpeed = 0`.

---

## 3. Actor Interactions

| Actor | Module Access | Key Operations |
|---|---|---|
| **Super Admin / Platform Admin** | Full access to all vehicle endpoints | Create/edit/delete vehicles, manage types, export data, transfer devices, assign licences |
| **App Admin** | Scoped to their `idApp` | Manage vehicles within their application, create groups, edit vehicle types |
| **End User (Subscriber)** | Own vehicles + shared vehicles | Read vehicle data, create own groups, add vehicles to groups, update group names |
| **Sales Agent** | Via `/bike` endpoints | View assigned vehicles' live data; fuel calibration on client site visit |
| **Mobile App** | `/bike` endpoints | Live dashboard (`GetAllWorkingBike`), vehicle detail, driving data |
| **Web App** | `/vehicles`, `/vehiclegroup`, `/vehicletype`, `/canbusdata` | Fleet overview, group management, CAN bus diagnostics, export |

---

## 4. Validation Rules

### Vehicle (tblvehicle)

| Field | Validation Rule | Source |
|---|---|---|
| `deviceid` | Uniqueness enforced via `findOrCreate`; duplicate device returns `"Vehicle Detail is already Exist..."` | `vehicles.js` SaveVehicle |
| `id` == 0 | Triggers create path; `id` > 0 triggers update path | `vehicles.js` SaveVehicle |
| `id` (delete) | Must not be null or empty; vehicle must exist with `IsDelete = false` | `vehicles.js` DeleteVehicle |
| `renewaldate` | Required to participate in `AssignLicenceToExistVehicle` bulk assignment | `vehicles.js` |
| `fullfuelpoint` / `fueltanksize` | Parsed as `parseFloat`; defaults to `0` if empty/null | `fuelcalibration.js` SetVehicleFuelData |

### Vehicle Group (tblvehiclegroup)

| Field | Validation Rule | Source |
|---|---|---|
| `GroupName` | Must be unique per `IdUser`; duplicate returns `"Group is already exist..."` | `vehicles.js` SaveVehicleGroup |
| `Id` == 0 | Triggers create path; `Id` > 0 triggers update path | `vehicles.js` SaveVehicleGroup |
| Group delete | Nullifies all vehicle and share-device group references before destroying the group record | `vehicles.js` GroupRemoveById |

### Vehicle Type (tblvehicletype)

| Field | Validation Rule | Source |
|---|---|---|
| `Type` | Must be unique per `idApp`; duplicate returns `"Vehicle Type is already Exist..."` | `vehicletype.js` SaveVehicleType |
| `id` == 0 | Create path with `findOrCreate` | `vehicletype.js` |
| Delete blocked | Type cannot be deleted if any `tblvehicle` row has `idType` pointing to it | `vehicletype.js` DeleteVehicleTypeById |
| `IsActive` | Must be set before the type appears in client dropdown (`GetAllActivevehicletype`) | `vehicletype.js` UpdateIsActiveStatus |
| Icon upload | File extension is extracted and preserved; old icon file is deleted from disk before overwrite | `vehicletype.js` uploadFile |
| `idApp` | If `GetAllActivevehicletype` receives `idApp` with no results, falls back to `idApp = null` (global types) | `vehicletype.js` |

### JWT Authentication

| Rule | Source |
|---|---|
| All mutating endpoints (`SaveVehicle`, `DeleteVehicle`, `TransferDevicetoUser`, etc.) require a JWT in the `Authorization` header | All controllers |
| Token is decoded with `jwt.decode(token, TokenKey)` and validated against `tbluserinformation` by `username + password` | All controllers |
| If `User.findOne` returns null, the API responds with `InvalidToken` | All controllers |

### CAN Bus Filter

| Field | Validation Rule |
|---|---|
| `DeviceId` | Required; if missing, returns empty DataTables response rather than an error | `canbusdata.js` GetAllCanbusData |
| `StartDate` / `EndDate` | Converted to UTC Unix timestamps before filtering | `canbusdata.js` |

---

## 5. API Endpoints

### `/vehicles` — Vehicle Management

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/vehicles/AssignLicenceToExistVehicle` | Bulk-assign unassigned licences to existing vehicles that have a renewal date | `?AppName={string}` | `{ success, message }` | ✅ JWT |
| GET | `/vehicles/UpdateExpiryDate` | Update a vehicle's renewal/expiry date and sync to `tbllicencemanager` | `?id&renewaldate` | `{ success, message }` | ✅ JWT |
| GET | `/vehicles/GetAllGroup` | Get all vehicle groups for a user | `?IdUser={int}` | Array of group objects | ✅ JWT (headers) |
| GET | `/vehicles/AddVehicleToGroup` | Assign selected vehicles & shared devices to a group | `?Id&idUser&DeviceList&SharedDeviceList` | `{ success, message, TotalError, TotalSuccess }` | ✅ JWT |
| GET | `/vehicles/GroupRemoveById` | Delete group and unassign all member vehicles | `?Id={int}` | `{ success, message }` | ✅ JWT |
| GET | `/vehicles/updateVehicleGroupName` | Rename a vehicle group | `?Id&GroupName` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicles/GetAllNotAssignGroupVehicle` | Get vehicles not in a group (for group editor) | `?IdGroup&IdUser` | Array of vehicle objects | ❌ |
| POST | `/vehicles/SaveVehicleGroup` | Create or update a vehicle group | Body: `{ Id, IdUser, GroupName, ... }` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicles/GetAllDynamicVehicle` | Get all vehicles with full joins (DataTables) | DataTables params + `appId`, `UserId`, `AdvanceSearch` | DataTables JSON response | ❌ |
| GET | `/vehicles/ExportVehicle` | Export vehicle list to XLSX | `?appId&UserId&IsOnline&idType&StartDate&EndDate&CurrentOffset&IsTrackingApp` | XLSX file download | ❌ |
| POST | `/vehicles/SaveVehicle` | Create or update a vehicle record | Body: `{ id, deviceid, iduser, Name, idType, renewaldate, ... }` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicles/DeleteVehicle` | Soft-delete a vehicle (`IsDelete = true`) | `?id&Type` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicles/GetAllVehicleByUser` | Get all active non-deleted vehicles for a user | `?iduser&idSalesAgent` | Array of vehicle objects with `ExpiryDate` | ❌ |
| GET | `/vehicles/GetAllVehicleById` | Get a single vehicle by primary key | `?id={int}` | Vehicle object or RecordNotFound | ❌ |
| GET | `/vehicles/GetDrivingDataByDeviceId` | Get latest driving data record | `?DeviceId={string}` | `{ success, message, data }` | ❌ |
| GET | `/vehicles/GetVehicleCurrentLocation` | Get live GPS data from Redis cache | `?DeviceId={string}` | `{ success, data: { GPS object } }` | ❌ |
| GET | `/vehicles/GetAllOnlineVehicle` | Get all currently online vehicles (DataTables) | DataTables params + `appId`, `UserId` | DataTables JSON response | ❌ |
| GET | `/vehicles/getAllDefaultValue` | Get all system default values | — | Array of default value objects | ❌ |
| GET | `/vehicles/UpdateDefultValue` | Update a system default value by type | `?Type&Value` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicles/GetAllNotAssignDevice` | Get GPS devices not yet linked to any vehicle | — | `{ success, data: [{ id, DeviceId }] }` | ❌ |
| GET | `/vehicles/TransferDevicetoUser` | Reassign a GPS device to a vehicle, reset MaxSpeed, update fences | `?id&deviceid&olddeviceid` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicles/GetAllNotUseDevcie` | Get vehicles with no engine-on GPS data in the last 10 days | `?UserId` | Array of vehicle + last-GPS-data objects | ❌ |
| GET | `/vehicles/GetAllVehicleDeviceId` | Search vehicles by device ID substring | `?search={string}` | Array of vehicle objects | ❌ |

---

### `/vehiclegroup` — Admin Group Cross-Reference

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/vehiclegroup/GetvehicleGroupWise` | Paginated list of vehicles with group, user, and app info (DataTables) | DataTables params | DataTables JSON response | ❌ |
| GET | `/vehiclegroup/GetAllGroupUserWise` | All groups belonging to a specific user | `?IdUser={int}` | Array of group objects | ❌ |
| GET | `/vehiclegroup/GetAllVehicleUserWise` | All vehicles for a user that are not in any group | `?IdUser={int}` | Array of vehicle objects | ❌ |
| POST | `/vehiclegroup/SaveVehicleGroup` | Assign a vehicle to an existing group | Body: `{ idVehicle, IdGroup }` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehiclegroup/DeleteVehicleGroup` | Remove a vehicle from its group (set IdGroup = null) | `?id={vehicleId}` | `{ success, message, data }` | ✅ JWT |

---

### `/vehicletype` — Vehicle Type Management

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/vehicletype/GetAllActivevehicletype` | Get active vehicle types for an app (falls back to global types) | `?idApp={int}` | Array of vehicle type objects | ❌ |
| GET | `/vehicletype/Getvehicletype` | Paginated vehicle type list with app info (DataTables) | DataTables params | DataTables JSON response | ❌ |
| POST | `/vehicletype/SaveVehicleType` | Create or update a vehicle type | Body: `{ id, Type, idApp, IsActive }` | `{ success, message, data }` | ✅ JWT |
| GET | `/vehicletype/DeleteVehicleTypeById` | Delete vehicle type if no vehicles reference it | `?id={int}` | `{ success, message }` | ✅ JWT |
| GET | `/vehicletype/UpdateIsActiveStatus` | Toggle active/inactive for a vehicle type | `?id&IsActive={0|1}` | `{ success, message, data }` | ✅ JWT |
| POST | `/vehicletype/uploadFile` | Upload map icons for a vehicle type | Multipart form with files keyed as `{id},{IconType}` | `{ success, message, data }` | ❌ |
| GET | `/vehicletype/GetActivevehicletype` | Find a single active vehicle type by name | `?Type={string}` | Vehicle type object or error | ❌ |

---

### `/bike` — Mobile / Web Vehicle Data

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/bike/getAllBikeByUser` | All non-deleted vehicles with a device for a user | `?idUser={int}` | Array of vehicle objects | ❌ |
| GET | `/bike/GetVehicleById` | Get single vehicle by ID | `?idVehicle={int}` | `{ success, message, data }` | ❌ |
| GET | `/bike/GetVehicleDetailById` | Vehicle detail with GPS device expiry and date fields (timezone-converted) | `?idVehicle={int}` | `{ success, data }` | ❌ |
| POST | `/bike/GetAllWorkingBike` | **Mobile app live dashboard** — vehicles with Redis GPS merge | `?idUser={int}` | `{ success, data: [vehicles with GPS] }` | ❌ |
| GET | `/bike/GetAllWorkingBikeWebApp` | **Web app dashboard** — vehicles with fuel, groups, notifications, Redis GPS | `?idUser={int}` | `{ success, data: [vehicles with GPS] }` | ❌ |

---

### `/fuelCalibration` — Fuel Calibration

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/fuelCalibration/SetfullfuelPoint` | Read raw AD1 fuel sensor value from Redis (used when tank is full) | `?deviceid={string}` | `{ AD1: int, GPSDate }` | ❌ |
| GET | `/fuelCalibration/GetVehicleDetail` | Get vehicle info + live GPS data from Redis for calibration UI | `?DeviceId={string}` | `{ success, data: { vehicle + GPS } }` | ❌ |
| GET | `/fuelCalibration/SetVehicleFuelData` | Store computed fuel calibration on vehicle record | `?deviceid&fullfuelpoint&fueltanksize` | `{ success, message }` | ❌ |

---

### `/canbusdata` — CAN Bus / OBD Telemetry

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/canbusdata/GetAllCanbusData` | Paginated CAN bus data filtered by device and date range (DataTables) | DataTables params + `DeviceId`, `StartDate`, `EndDate`, `idApp` | DataTables JSON response | ❌ |
| GET | `/canbusdata/ExportAllCanbusData` | Export all CAN bus data to XLSX | `?DeviceId&StartDate&EndDate&idApp` | XLSX file download (18 columns) | ❌ |

---

## 6. Database Interactions

### tblvehicle

**Key fields:** `id` (PK), `iduser` (FK → tbluserinformation), `Name`, `deviceid` (unique tracker ID), `renewaldate`, `IsOnline`, `HandshakDatetime`, `IsDelete`, `DeviceType`, `DeviceCompany` (default `'Maark'`), `idType` (FK → tblvehicletype), `IdGroup` (FK → tblvehiclegroup), `idSalesAgent`, `MaxSpeed`, `IsACC`, `OdoMeter`, `FuelRatio`, `FuelCapacity`, `IsFule`, `FuleType`, `FuelCost`, `Average`, `InsurenceDate`, `PUCDate`, `PUCNo`, `RCNo`, `LicenceNo`, `Insurence`, `DriverName`, `ShareCode`, `IsShared`, `SleepMode`, `GPRSInterval`, `GPRSStopInterval`, `HeartbeatInterval`, `Relay`, `Siren`, `DoorLock`, `DoorUnlock`, `IsIgnition`, `IsEmail`, `IdleMinute`, `CreatedDate`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`

**Queries performed:**
- `findOrCreate` by `deviceid` — creates vehicle on first registration
- `update` by `id` — updates all fields on edit
- `updateAttributes({ IsDelete: true })` — soft delete
- `updateAttributes({ renewaldate })` — expiry date update
- `updateAttributes({ IdGroup })` — group assignment
- `updateAttributes({ FuelRatio, FuelCapacity, IsFule })` — fuel calibration
- `updateAttributes({ deviceid, MaxSpeed: 0 })` — device transfer
- `findAll` with `IsDelete: 0` and `deviceid != ''` — vehicle listing
- Raw SQL `UPDATE tblvehicle SET IdGroup=null WHERE IdGroup=X` — group member removal

### tblvehiclegroup

**Key fields:** `Id` (PK), `GroupName`, `IdUser` (FK → tbluserinformation), `CreatedDate`, `CreatedBy`

**Queries performed:**
- `findOne` by `{ IdUser, GroupName }` — uniqueness check
- `create` — new group
- `update` by `Id` — rename group
- `destroy` by `Id` — delete group
- `findAll` by `IdUser` — list user's groups
- `updateAttributes({ GroupName })` — rename
- `findAndCountAll` with joins to `tblvehicle`, `tbluserinformation`, `tblappinfo` — admin view

### tblvehicletype

**Key fields:** `id` (PK), `Type` (name), `IsActive`, `idApp` (FK → tblappinfo), `OnIcon`, `OffIcon`, `ActiveIcon`, `PowerCuttIcon`, `LocateOnIcon`, `LocateOffIcon`, `LocateActiveIcon`, `LocatePowerCuttIcon`, `LocateIsRotate`, `CreatedDate`, `CreatedBy`

**Queries performed:**
- `findOrCreate` by `{ Type, idApp }` — create with duplicate prevention
- `findOne` by `{ Type, idApp }` — duplicate check for update
- `update` by `id` — update type
- `updateAttributes({ IsActive })` — toggle activation
- `updateAttributes({ OnIcon, OffIcon, ... })` — icon assignment after file upload
- `destroy` by `id` — hard delete (guarded by vehicle reference check)
- `findAll` by `{ IsActive: 1, idApp }` — active types for client dropdown

### tblcanbusdata

**Key fields** (from export columns): `id`, `DeviceId`, `Datetime` (Unix timestamp), `BatteryVoltage`, `EngineSpeed`, `RunningSpeed`, `CoolantTemperature`, `ThrottleOpeningWidth`, `EngineLoad`, `InstantaneousFuelConsumption`, `AverageFuelConsumption`, `DrivingRange`, `TotalMileage`, `SingleFuelConsumptionVolume`, `TotalFuelConsumptionVolume`, `CurrentErrorCodeNumbers`, `HarshAccelerationNo`, `HarshBrakeNo`, `CreatedDate`

**Queries performed:**
- Raw SQL SELECT with dynamic WHERE on `DeviceId`, `Datetime` range, `idApp` — paginated and counted separately
- All queries execute on `connectionCanbus` (a separate database connection)

### tbllicencemanager

**Key fields:** `LicenceNo`, `DeviceID`, `ExpiryDate`, `IdApp`, `IsDeleted`, `CreatedDate`

**Queries performed:**
- `findOne` by `{ DeviceId, IsDeleted: 0 }` — check if licence already assigned
- `findOne` by `{ DeviceID: null, IsDeleted: 0, idApp }` — find next unassigned licence
- `updateAttributes({ DeviceId, ExpiryDate, CreatedDate })` — assign licence to device
- `updateAttributes({ ExpiryDate })` — sync expiry when `renewaldate` is updated

### Redis Cache

- `client.get(deviceid)` — fetch live GPS packet (JSON string)
- `Commonfunction.UpdateVehicleRedis(deviceid, 'Vehicle')` — push updated vehicle config to Redis after any save
- `Commonfunction.DeleteVehicleRedis(deviceid)` — remove key on vehicle deletion
- Live GPS fields: `IsEngine`, `Latitude`, `Longitude`, `Datetime`, `Date`, `Speed`, `Direction`, `OdoMeter`, `AD1`, `AD2`, `IsWiringForAntiTamper`

---

## 7. Edge Cases & Error Handling

### Vehicle Operations

| Scenario | Behaviour |
|---|---|
| `SaveVehicle` with duplicate `deviceid` | Returns `{ success: false, message: "Vehicle Detail is already Exist..." }` |
| `DeleteVehicle` with empty `id` query param | Returns `{ success: false, message: "Select Vehicle To delete" }` |
| `DeleteVehicle` with non-existent or already-deleted vehicle | Returns `RecordNotFound` global constant |
| `GetVehicleCurrentLocation` with device not in Redis | Returns `RecordNotFound` |
| `UpdateExpiryDate` with non-existent vehicle | Returns `{ success: false, message: 'vehicle not found..' }` |
| `TransferDevicetoUser` with SQL error | Returns `{ success: false, data: [] }` |
| `GetAllNotUseDevcie` — no engine-on records in DB | Returns empty array (no error) |
| Invalid / missing JWT token | Returns global `InvalidToken` object `{ success: false, InvalidToken: true, data: ... }` |

### Vehicle Group Operations

| Scenario | Behaviour |
|---|---|
| `SaveVehicleGroup` with duplicate `GroupName` for same user | Returns `{ success: false, message: "Group is already exist..." }` |
| `GroupRemoveById` — SQL update fails | Returns `{ success: false, message: 'Group is not removed..' }` |
| `AddVehicleToGroup` — empty `DeviceList` or `SharedDeviceList` | Silently skips that step (calls `uploder(i+1)` without executing the SQL UPDATE) |
| Redis update failure in `ManageRedisForVehicle` | No error returned to client; Redis update is best-effort |

### Vehicle Type Operations

| Scenario | Behaviour |
|---|---|
| `DeleteVehicleTypeById` when vehicles reference the type | Returns `{ success: true, message: "This Type of Vehicel Exist..So, You can not delete this Vehicle Type" }` (note: `success: true` is a bug — deletion was blocked; also "Vehicel" is a typo in source) |
| `GetAllActivevehicletype` returns no results for `idApp` | Falls back to a second query with `idApp: null` (global/shared types) |
| Icon upload with no matching `VehicleType` record | Returns `{ success: false, message: "File not uploaded..." }` |
| Icon upload with old file that does not exist on disk | `fs.exists` check prevents any unlink error; new file is saved regardless |

### Fuel Calibration

| Scenario | Behaviour |
|---|---|
| `SetVehicleFuelData` with no vehicle matching `deviceid` | Returns `{ success: false, message: "Vehicle not assign with this device ID." }` |
| Redis unavailable for `SetfullfuelPoint` | Returns `{ AD1: 0, GPSDate: 0 }` — caller must recognise 0 as an invalid reading |
| `fullfuelpoint` or `fueltanksize` is missing/empty | Defaults to `0`; `FuelRatio` becomes `(0 - 40) / 0 = -Infinity` — no server-side guard |

### CAN Bus Queries

| Scenario | Behaviour |
|---|---|
| `GetAllCanbusData` called without `DeviceId` | Returns `{ draw, recordsTotal: 0, recordsFiltered: 0, data: [] }` |
| `connectionCanbus` query returns `undefined` | Returns empty DataTables response |
| `ExportAllCanbusData` with no matching records | Returns empty XLSX with headers only |

### Licence Assignment

| Scenario | Behaviour |
|---|---|
| No unassigned licences remain for the app | Returns `{ success: false, message: "Licence assign to N Vehicle successfully. No more Licence available..." }` and stops the batch |
| All vehicles already have licences | Returns `{ success: false, message: 'Licence already assigned for this vehicle' }` |

### Audit Logging

All mutating operations call `funAuditLog.CreateAuditLog(action, username, description)` for compliance. The `CreateAuditLogLicence` variant is used for all licence-related operations, recording the old and new expiry dates.
