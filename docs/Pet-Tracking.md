# Pet Tracking Module

## 1. Module Purpose

This module manages the full lifecycle of **pet/device monitoring** within the Maark / GPScannerAPI platform. It covers:

- **Device Registry** (`PetDevice.js`): registering GPS tracker hardware against user accounts, managing SIM card bindings, tracking device status and expiry, bulk import, and Excel export of device inventories.
- **Pet Tracking / Device Tracking** (`petTracking.js`): managing `tbldevicetracking` records that associate a device with a tracking configuration; importing pet adventure GPS logs from CSV files.
- **Alarm Management** (`petAlarm.js`): storing, querying, paging, filtering, and marking as read the alarm events emitted by GPS devices (geofence breach, SOS, speed alerts, etc.).
- **Pet Geofence** (`petFence.js`): per-device virtual boundary management with real-time inside/outside evaluation using geolib and Redis-backed GPS positions.

**Controllers involved:** `petTracking.js`, `petAlarm.js`, `PetDevice.js`, `petFence.js`

---

## 2. Business Workflow (Step-by-Step)

### 2a. Registering a GPS Device (`PetDevice.js`)
1. Admin calls `POST /SaveGPSDevice` with device details and a valid JWT.
2. JWT decoded; user validated against `tbluserinformation`.
3. If `Id == 0`: new device record created in `tblvehicle`.
4. If `Id != 0`: existing device updated.
5. SIM service can be bound to a device via `POST /SaveSimServiceToIMEI` — links IMEI to a SIM service record.
6. Device status toggled via `GET /UpdateStatus` (marks active/inactive).
7. Bulk device upload supported via `POST /uploadExcelDevice` (parses uploaded Excel file row-by-row).
8. Audit log entry created on create/update/delete.

### 2b. Retrieving Device Lists (`PetDevice.js`)
1. `GET /GetAllGPSDevice` returns devices for a user with optional filters: country, status, expiry exclusions.
2. Each device record includes fence status (`IsInFence`), latest GPS coordinates from Redis cache.
3. `GET /GetAllPetbyCountry` returns device counts grouped by country.
4. `GET /ExportTracker` streams an XLSX file with all device data for a user.
5. `GET /GetGPSDeviceByIMEI` looks up a device by its IMEI number.
6. `GET /GetSIMDetailBySerialNum` retrieves SIM card detail by serial number.

### 2c. Managing Pet Tracking Records (`petTracking.js`)
1. `GET /GetAllPetTracking` returns all `tbldevicetracking` rows.
2. `GET /GetPetTrackingById` fetches a single tracking config by `idPetTracking`.
3. `POST /SavePetTracking` creates (id==0) or updates an existing tracking record; requires JWT.
4. `GET /DeletePetTracking` hard-deletes a tracking record by `idPetTracking`; requires JWT.
5. `POST /ImportPetAdventures` accepts a CSV file upload, parses each row (NMEA-like format), and calls `findOrCreate` on `tblgpsscanner` to avoid duplicates.

### 2d. Adventure GPS Import Flow (`petTracking.js`)
1. Client sends multipart file upload to `POST /ImportPetAdventures`.
2. File saved to `MediaUploads/FileUpload/` with a timestamp-based unique filename.
3. File read line-by-line; each line split by comma.
4. Date parsed from fields: `YYMMDD` (index 3) and `HHMMSS` (index 4).
5. Latitude from index 6; negated if direction (index 7) == `'E'` (note: likely intended `'S'`).
6. Longitude from index 8; negated if direction (index 9) == `'W'`.
7. `findOrCreate` on `{Datetime, DeviceId}` prevents duplicate import.
8. `IsAdvanture = 1` flag set on all imported records.
9. Response returned after all rows processed.

### 2e. Alarm Lifecycle (`petAlarm.js`)
1. GPS device emits alarm; backend stores record in `tblalarm` with `DeviceId`, `AlarmCode`, `Datetime`, `Date`, `Latitude`, `Longitude`, `FenceName`, `IsRead = 0`.
2. Mobile/web client polls `GET /GetPetAlarmByDeviceId` (paginated, 10 per page) or `GET /GetVehicleAlarmByUser` (multi-device, filterable).
3. User reads notifications; client calls `POST /UpdateReadStatus` with array of alarm IDs → `IsRead` set to `1`, Socket.IO event `{userId}UpdateNotification` emitted.
4. `GET /setAlarmMarkAsRead` bulk-marks all alarms for a DeviceId as read (mobile convenience endpoint).
5. `GET /setAlarmMarkAsReadweb` bulk-marks alarms for an array of DeviceIds as read (web client endpoint).
6. `GET /GetTotalNotificationCount` returns unread count for a single device.
7. `GET /GetAllTotalNotificationCount` returns total unread count across all devices owned by a user.
8. `GET /DeleteVehicleAlarm` hard-deletes all alarms for all devices belonging to a user.

### 2f. Per-Device Geofence for Pet (`petFence.js`)
1. Client calls `POST /SaveFence` with fence geometry.
2. `findOrCreate` on `tblfence` keyed on `deviceId` — one fence per device.
3. Latest GPS position retrieved from `tblgpsdata`.
4. Fence containment calculated via `geolib` for `circle`, `polygon`, `polyline`, `rectangle`.
5. `tblvehicle.IsInFence` updated; Redis cache refreshed via `UpdateVehicleRedis`.
6. `GET /IsPetInFence` provides on-demand point-in-fence check without persisting any data.

---

## 3. Actor Interactions

| Actor | Actions |
|---|---|
| **Authenticated User** (JWT) | Register/update/delete devices, save/delete tracking configs, mark alarms read, delete alarms |
| **Admin** | Bulk upload devices via Excel, bind SIM services to IMEI, export device tracker list |
| **GPS Device / Tracker** | Sends GPS data stored in `tblgpsdata` / `tblgpsscanner`; emits alarm events to `tblalarm` |
| **Mobile App Client** | Poll alarm lists, get unread counts, import pet adventure CSV |
| **Web Dashboard Client** | Retrieve all devices by user, filter alarms by device/alarm code/date range, bulk-read alarms |
| **Socket.IO Subscriber** | Receives `{userId}UpdateNotification` when alarms marked read |

---

## 4. Validation Rules

### Device Management (`PetDevice.js`)
| Field | Rule |
|---|---|
| JWT token | Required for `SaveGPSDevice`, `DeleteDeviceById`, `uploadExcelDevice`, `SaveSimServiceToIMEI`, `DeleteVehicle` |
| `Id` | `0` = create new device; non-zero = update existing |
| IMEI | Used as lookup key in `GetGPSDeviceByIMEI` |
| `iduser` | Required for `GetAllGPSDevice`, `GetAllTotalNotificationCount`, `DeleteVehicle` |
| `ExpiredDevice` | Comma-separated device ID exclusion list; appended as `NOT IN (...)` SQL clause |
| `DeviceId` | Optional filter; `-1` or `'All'` treated as "no filter" |

### Pet Tracking (`petTracking.js`)
| Field | Rule |
|---|---|
| JWT token | Required for `SavePetTracking`, `DeletePetTracking` |
| `id` | `0` = create; non-zero = update (in `SavePetTracking`) |
| `idPetTracking` | Required for `GetPetTrackingById`, `DeletePetTracking` — must resolve to existing record |
| CSV file | Must be parseable text file; each row must have at least 12 comma-delimited fields |
| `Datetime` + `DeviceId` | Composite dedup key in `findOrCreate` for GPS import |

### Alarm Management (`petAlarm.js`)
| Field | Rule |
|---|---|
| JWT token | Required for `SavePetAlarm`, `DeleteVehicleAlarm`, `UpdateReadStatus` |
| `id` | `0` = create (uses `findOrCreate` on `idpet`); non-zero = update |
| `idpet` | Unique constraint for create: `findOrCreate` on `idpet` prevents duplicate alarms per pet |
| `DeviceId` | Required for `GetPetAlarmByDeviceId`, `setAlarmMarkAsRead`, `GetTotalNotificationCount` |
| `iduser` | Required for `GetAllTotalNotificationCount`, `DeleteVehicleAlarm`, `GetVehicleAlarmByUser` |
| `page` | Integer; offset = `page * 10` (or `page * limit`) for pagination |
| `limit` | Optional; defaults to `10`; used in `GetVehicleAlarmByUser` |
| `AlarmCode` | Optional filter; `-1` / `'All'` = no filter; `50` also includes code `52`; `51` also includes code `53` |
| `StartTime` / `EndTime` | Optional ISO date strings; converted to Unix timestamps for `tblalarm.Date` range filter |
| `ExpiredDevice` | Comma-separated exclusion list; `NOT IN (...)` filter in `GetVehicleAlarmByUser` and count queries |
| `DeviceArray` | Array of DeviceIds for `setAlarmMarkAsReadweb` bulk-read |
| Alarm update dedup | `findOne` check before update: if `objPetAlarm.id != objPetAlarmExist.id` → duplicate conflict error |

### Pet Fence (`petFence.js`)
| Field | Rule |
|---|---|
| `deviceId` | Required; `findOrCreate` key — one active fence per device |
| `name` | NOT NULL in schema |
| `fencedraw` | Accepted: `circle`, `polygon`, `polyline`, `rectangle` |
| `lat` / `lng` | For multi-point shapes: comma-separated strings; split on `,` for polygon vertex array |
| `range` | Used as radius in metres for circle fence |
| `idFence` | Must resolve to existing row for `GetFenceById` |

---

## 5. API Endpoints

### Device Management (`PetDevice.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllGPSDevice` | List all devices for a user with GPS/fence status | `?iduser, ?DeviceId, ?ExpiredDevice` | Array of device objects | No |
| GET | `/GetAllGPSDeviceold` | Legacy device list endpoint | `?iduser` | Array | No |
| GET | `/ExportTracker` | Download device list as XLSX | `?iduser` | `.xlsx` file | No |
| GET | `/GetGPSDeviceById` | Get single device by ID | `?Id` | `{success, data}` | No |
| GET | `/GetAllPetbyCountry` | Get device counts by country | `?iduser` | Array | No |
| GET | `/DeleteDeviceById` | Soft-delete a device | `?Id` | `{success, message}` | **JWT** |
| POST | `/SaveGPSDevice` | Create or update a GPS device | `{Id, Name, deviceid, iduser, ...}` | `{success, message}` | **JWT** |
| GET | `/UpdateStatus` | Toggle device active/inactive status | `?Id, ?Status` | `{success, message}` | No |
| POST | `/uploadExcelDevice` | Bulk import devices from Excel file | multipart file upload | `{success, message}` | **JWT** |
| GET | `/DownloadTemplate` | Download device import Excel template | — | `.xlsx` template | No |
| GET | `/GetGPSDeviceByIMEI` | Look up device by IMEI | `?IMEI` | `{success, data}` | No |
| GET | `/GetSIMDetailBySerialNum` | Get SIM details by serial number | `?SerialNum` | `{success, data}` | No |
| POST | `/SaveSimServiceToIMEI` | Bind SIM service to device IMEI | `{IMEI, SimServiceId, ...}` | `{success, message}` | **JWT** |
| POST | `/DeleteVehicle` | Hard-delete vehicle and related data | `{Id}` | `{success, message}` | **JWT** |

### Pet Tracking (`petTracking.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllPetTracking` | List all tracking records | — | Array | No |
| GET | `/GetPetTrackingById` | Get single tracking record | `?idPetTracking` | `{success, data}` | No |
| POST | `/SavePetTracking` | Create or update tracking record | `{id, DeviceId, ...}` | `{success, message, data}` | **JWT** |
| GET | `/DeletePetTracking` | Hard-delete tracking record | `?idPetTracking` | `{success, message}` | **JWT** |
| POST | `/ImportPetAdventures` | Import GPS adventure log from CSV | multipart file upload | `{success, data}` | No |

### Alarm Management (`petAlarm.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllPetAlarm` | List all alarms (unfiltered) | — | Array | No |
| GET | `/GetPetAlarmByDeviceId` | Paged alarms for a device | `?DeviceId, ?page` | Array (10/page) | No |
| GET | `/GetAlarmByDeviceId` | All alarms for a device (unpaged) | `?deviceid` | Array | No |
| GET | `/GetPetAlarmById` | Get single alarm by ID | `?idPetAlarm` | `{success, data}` | No |
| POST | `/SavePetAlarm` | Create or update alarm record | `{id, idpet, DeviceId, AlarmCode, ...}` | `{success, message, data}` | **JWT** |
| GET | `/DeleteVehicleAlarm` | Delete all alarms for user's devices | `?UserId` | `{success, message}` | **JWT** |
| GET | `/GetVehicleAlarmByUser` | Filtered paged alarm list for user | `?UserId, ?DeviceId, ?AlarmCode, ?StartTime, ?EndTime, ?page, ?limit, ?ExpiredDevice` | `{success, data[]}` | No |
| POST | `/UpdateReadStatus` | Mark specific alarms as read | `[alarmId, ...]` (array body) | `{success, data}` | **JWT** |
| GET | `/GetTotalNotificationCount` | Unread alarm count for a device | `?DeviceId` | `{success, data}` | No |
| GET | `/GetAllTotalNotificationCount` | Total unread count across all user devices | `?iduser, ?ExpiredDevice` | `{success, data}` | No |
| GET | `/setAlarmMarkAsRead` | Mark all alarms read for a device | `?DeviceId` | `{success, message}` | No |
| GET | `/setAlarmMarkAsReadweb` | Mark all alarms read for device array | `?DeviceArray[]` | `{success, message}` | No |

### Pet Geofence (`petFence.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllFence` | List all fence records | — | Array | No |
| GET | `/IsPetInFence` | On-demand point-in-fence check | `?deviceId, ?lat, ?lng` | `{success, message}` | No |
| GET | `/GetFenceByPet` | Get fence for a device | `?deviceId` | `{success, data}` | No |
| GET | `/GetAllFenceByVehicle` | List all fences for a device | `?deviceId` | `{success, data[]}` | No |
| GET | `/GetFenceById` | Get fence by primary key | `?idFence` | `{success, data}` | No |
| POST | `/SaveFence` | Create or update per-device fence | `{deviceId, name, lat, lng, fencedraw, range, status}` | `{success, message}` | No |
| POST | `/SaveFenceById` | Create/update fence with explicit GPS check | `{deviceId, name, lat, lng, fencedraw, range, status}` | `{success, message}` | No |
| POST | `/UpdateFenceNameById` | Rename a fence | `{id, name}` | `{success, message}` | No |
| GET | `/DeleteFence` | Delete fence by deviceId | `?deviceId` | `{success, message}` | No |
| GET | `/DeleteFenceById` | Delete fence by primary key | `?id` | `{success, message}` | No |
| GET | `/GetFencedeivce` | Get device info linked to a fence | `?deviceId` | `{success, data}` | No |

---

## 6. Database Interactions

### Models Used

| Model | Table | Description |
|---|---|---|
| `tbldevicetracking` | `tbldevicetracking` | Maps a tracking configuration to a GPS device |
| `tblgpsscanner` | `tblgpsscanner` | Raw GPS scanner records; used for adventure import |
| `tblalarm` | `tblalarm` | Device alarm events: AlarmCode, Datetime, Date (unix), GPS coords, FenceName, IsRead |
| `tblfence` | `tblfence` | Per-device geofence geometry; IsInFence flag |
| `tblvehicle` | `tblvehicle` | GPS device registry; IsInFence, status, iduser |
| `tblbike` | `tblbike` | Alternate vehicle/pet record (used in some fence update paths) |
| `tbluserinformation` | `tbluserinformation` | User accounts for JWT auth |
| `tblgpsdata` | `tblgpsdata` | Raw GPS positional data; used for fence evaluation and current location |
| `tblsharedevice` | `tblsharedevice` | Shared device access; joined in alarm queries for multi-owner support |

### Key Query Patterns

| Operation | Method | Notes |
|---|---|---|
| Real-time GPS position | `client.get(DeviceId)` Redis | Falls back to `tblgpsdata` query on miss |
| Alarm pagination | `findAll` with `offset`, `limit=10`, `order: 'Id DESC'` | Page zero-indexed: `offset = page * 10` |
| Multi-device alarm query | Raw SQL with dynamic `WHERE` clauses | Joins `tblalarm` → `tblvehicle` → `tblsharedevice` |
| Unread alarm count | Raw SQL `COUNT(*)` | Filters `IsRead=0`, `IsDelete=false` |
| Adventure GPS dedup | `findOrCreate` on `{Datetime, DeviceId}` | Prevents re-import of same GPS point |
| Fence containment | `geolib.isPointInCircle` / `isPointInside` | Applied for circle, polygon, polyline, rectangle shapes |
| Bulk alarm read | `PetAlarm.update({IsRead:1}, {where: {Id: {in: idList}}})` | Batch update; emits Socket.IO notification |
| Device status | Raw SQL `UPDATE` via `UpdateStatus` / `UpdateStatusold` | Sets active flag on device record |

---

## 7. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Missing or invalid JWT | Returns `InvalidToken` JSON constant |
| User not found after JWT decode | Returns `InvalidToken` |
| Tracking record not found | Returns `RecordNotFound` JSON constant |
| `DeletePetTracking` — record does not exist | `destroy` returns falsy; returns `RecordNotFound` |
| Duplicate pet alarm on create | `findOrCreate` on `idpet` returns existing; `{success: false, message: 'Pet Alarm is already Exist...'}` |
| Alarm update with mismatched ID | `objPetAlarm.id != objPetAlarmExist.id` check; returns `{success: false, message: 'Pet is already Exist...'}` |
| Redis unavailable for fence check | Falls back to `PetGPS.findOne` (last GPS from DB) |
| GPS record null during fence save | `IsPetInFence` defaults to `true`; fence still saved |
| `ImportPetAdventures` empty array or null line | `ListData` checks `objData != ''`; responds with success when array exhausted |
| CSV parsing edge case (direction `'E'` negation) | Code negates latitude when direction index is `'E'` — this appears to be a logic bug (should be `'S'` for south latitude negation) |
| Alarm `AlarmCode` alias grouping | Code `50` matches `50` OR `52`; code `51` matches `51` OR `53` (geofence entry/exit variants) |
| `GetVehicleAlarmByUser` SQL injection risk | `req.query` values directly interpolated into raw SQL string — no parameterisation; inputs should be sanitised |
| `GetTotalNotificationCount` SQL injection risk | `DeviceId` directly interpolated into raw SQL |
| `DeleteVehicleAlarm` vehicle list null | `if (resBike == null)` returns `RecordNotFound`; otherwise iterates device list |
| Socket.IO alarm notification | `io.sockets.emit(UserExist.id + 'UpdateNotification')` — emits on `UpdateReadStatus`; clients subscribe to their user ID channel |
| File upload path | Files saved to `MediaUploads/FileUpload/` relative to controller directory using timestamp filename to avoid collisions |
| `SavePetTracking` missing audit log on error | Audit log created before checking response validity — always logged even if DB response is falsy |
