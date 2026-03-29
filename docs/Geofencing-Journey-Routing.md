# Geofencing, Journey & Routing Module

## 1. Module Purpose

This module covers all geospatial boundary management, trip recording, route planning, and favourite place tracking within the **Maark / GPScannerAPI** platform. It provides the business logic to:

- Define and manage virtual geographic boundaries (geofences) at both the per-device level (`petFence.js` / `tblfence`) and the multi-device advance-fence level (`advancefence.js` / `tbladvancefence`).
- Record and query device journey history — start time, end time, GPS waypoints, odometer, and route names (`journey.js` / `tbljourneyroute`, `tbljourneygpsdata`).
- Create named route plans with waypoint markers and assign them to one or more devices (`routeplan.js` / `tblroute`, `tblroutedevice`, `tblroutemarker`).
- Save and query named favourite places tied to a device, with real-time inside/outside status (`favoriteplace.js` / `tblfavoriteplace`).

**Controllers involved:** `advancefence.js`, `petFence.js`, `journey.js`, `routeplan.js`, `favoriteplace.js`

---

## 2. Business Workflow (Step-by-Step)

### 2a. Creating an Advance Geofence (multi-device)
1. Authenticated user calls `POST /SaveFenceByIdNew` with fence geometry and a list of device IDs (`selectedlist`).
2. If `IdAdvanceFence == null/0`, a new `tbladvancefence` record is created (name, UserId, CreatedDate).
3. For each device in `selectedlist`, a row is bulk-inserted into `tblfence` linking the fence coordinates to that device via `IdAdvanceFence`.
4. For each device, the server fetches the latest GPS position from **Redis** (falling back to `tblgpsdata`).
5. Using **geolib**, the server evaluates whether the device is currently inside the fence (`IsInFence`) and updates `tblfence` and the device's Redis cache via `UpdateVehicleRedis`.
6. Audit log entry is created: `'SaveFenceByIdNew'`.

### 2b. Creating a Per-Device Geofence (`petFence.js`)
1. Client calls `POST /SaveFence` with a fence object (no auth token required in current code).
2. `Fence.findOrCreate` is called on `tblfence` keyed on `deviceId`.
3. Latest GPS position retrieved from `tblgpsdata` (order by `id DESC`).
4. Fence containment calculated via geolib for shape types: **circle**, **polygon**, **polyline**, **rectangle**.
5. Vehicle record (`tblvehicle`) is updated with `IsInFence` flag and Redis cache refreshed.

### 2c. Starting / Stopping a Journey
1. Client calls `POST /StartJourney` with `DeviceId`, `UserId`, `JourneyName` plus a valid JWT.
2. JWT decoded; user validated against `tbluserinformation`.
3. Server searches `tbljourneyroute` for an open journey (`EndTime IS NULL`) for the device.
   - **If open journey found:** update `EndTime = now`, `ModifiedDate`, `ModifiedBy`, `JourneyName` → journey **stopped**.
   - **If no open journey:** create new `tbljourneyroute` record with `StartTime = now` → journey **started**.
4. Socket.IO event `AllJourneyHook` emitted with `DeviceId`, `JourneyStart`, `JourneyName`, timestamp.
5. Audit log entry created.

### 2d. Querying Journey History
1. `GET /GetDeviceJourney` filters `tbljourneyroute` by `DeviceId`, `UserId`, optional `StartDate`/`EndDate` (on `StartTime`), and `EndTime IS NOT NULL`.
2. Results include joined vehicle name from `tblvehicle`.
3. `GET /GetDeviceLastJourney` returns the single open journey (`EndTime IS NULL`) for a device.
4. `GET /getAllCompletedJourney` returns all completed journeys (`IsCompleted = 1`, `IsDelete = 0`) with user information joined.

### 2e. Exporting Journey GPS Data
1. `GET /ExportReport` accepts `DeviceId`, `TodayStartDateTime`, `TodayEndDateTime`, `TimeZone`.
2. Raw SQL query on `tblgpsdata` with Unix-timestamp range filter.
3. Data converted to timezone-aware datetime using `moment-timezone`.
4. Excel file generated via `node-excel` and streamed as `TrackDetail.xlsx`.

### 2f. Creating a Route Plan
1. Client calls `POST /SaveRoutePlan` with `objRoute`, `selectedlist` (device IDs), and `objMarkerPin` (array of `{MarkerName, Lat, Lng}`).
2. JWT validated.
3. If `objRoute.Id == 0`: create new `tblroute`, bulk-insert devices into `tblroutedevice`, bulk-insert markers into `tblroutemarker`.
4. If `objRoute.Id != 0`: delete existing `tblroutedevice` rows and re-insert updated list.
5. `POST /updateRoutePlan` performs a full update: updates `tblroute`, deletes and re-inserts `tblroutemarker`.
6. `GET /DeleteRouteById` cascades: deletes `tblroutedevice`, `tblroutemarker`, then `tblroute`.

### 2g. Managing Favourite Places
1. Client calls `POST /SaveFavoritePlace` with `DeviceId`, `Name`, `Latitude`, `Longitude`, `Range`.
2. `findOrCreate` on `tblfavoriteplace` keyed on `(DeviceId, Name)`.
3. Latest device position fetched from **Redis**.
4. `geolib.isPointInCircle` determines `IsInFavoritePlace` flag; record updated.
5. `POST /UpdateFavoritePlaceNameById` allows renaming a saved place.
6. `GET /DeleteFavoritePlace` hard-deletes by `id`.

---

## 3. Actor Interactions

| Actor | Actions |
|---|---|
| **Authenticated User** (JWT) | Create/update/delete advance fences, start/stop journeys, save route plans, manage route markers |
| **Device / Tracker** | GPS position data stored in `tblgpsdata`; Redis cache used for real-time fence evaluation |
| **Unauthenticated Client** | `SaveFence` (per-device), `GetAllFence`, `IsPetInFence`, `GetFenceByPet`, `GetAllFenceByVehicle`, `GetFavoritePlaceByDevice`, `GetFavoritePlaceById`, `DeleteFavoritePlace` (no token guard in current code) |
| **Admin / Reporting User** | `ExportReport` for XLSX journey GPS download |

---

## 4. Validation Rules

### Advance Fence (`advancefence.js`)
| Field | Rule |
|---|---|
| `name` | Required (NOT NULL in `tbladvancefence`) |
| `selectedlist` | Must be non-empty array of device IDs; used for bulk fence assignment |
| `IdAdvanceFence` | If `0` or null → create new AdvanceFence; otherwise → update existing |
| `fencedraw` | Accepted values: `circle`, `polygon`, `polyline`, `rectangle` |
| `lat` / `lng` | For polygon/polyline/rectangle: comma-separated coordinate lists; split on `,` for multi-point evaluation |
| `range` | Used as radius (metres) when `fencedraw == "circle"` |
| JWT token | Must be present in Authorization header; decoded with `TokenKey`; user must exist in `tbluserinformation` with matching `username`+`password`+`idApp` |

### Per-Device Fence (`petFence.js`)
| Field | Rule |
|---|---|
| `deviceId` | Required; used as `findOrCreate` key in `tblfence` |
| `name` | Required (NOT NULL in `tblfence`) |
| `range` / `lat` / `lng` / `fencedraw` | All NOT NULL in schema |
| `idFence` | Must resolve to existing row for `GetFenceById` |

### Journey (`journey.js`)
| Field | Rule |
|---|---|
| JWT token | Required for `StartJourney`, `deleteJourneyById` |
| `DeviceId` | Optional filter on list queries; required for `StartJourney` toggle logic |
| `UserId` | Optional filter on list queries |
| `Id` | Must be non-empty for `deleteJourneyById`; validated before soft-delete |
| `StartDate` / `EndDate` | Optional ISO date strings for `GetDeviceJourney` range filter |
| `TodayStartDateTime` / `TodayEndDateTime` | Required for `ExportReport`; parsed through `convertdateformatForUnix` |
| `TimeZone` | Required for `ExportReport` timezone conversion |

### Route Plan (`routeplan.js`)
| Field | Rule |
|---|---|
| JWT token | Required for all write operations |
| `objRoute.Id` | `0` = create; non-zero = update/cascade-replace |
| `selectedlist` | Must be non-empty for device assignment during create |
| `objMarkerPin[].MarkerName` / `.Lat` / `.Lng` | Required per marker; used in bulk-insert |
| `Id` (query param) | Required for `DeleteRouteById` and `DeleteRoutemarker` |

### Favourite Place (`favoriteplace.js`)
| Field | Rule |
|---|---|
| `DeviceId` + `Name` | Composite unique key for `findOrCreate` |
| `id` | Must exist for `GetFavoritePlaceById`, `DeleteFavoritePlace`, `UpdateFavoritePlaceNameById` |
| `Range` | Used as circle radius in metres for `geolib.isPointInCircle` |
| `Latitude` / `Longitude` | Parsed as float for geospatial check |

---

## 5. API Endpoints

### Advance Fence & GPS (`advancefence.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetVehicleCurrentLocation` | Get latest device GPS from Redis or DB | `?DeviceId` | `{success, data}` | No |
| GET | `/GetLastGpsData` | Get last GPS record for every device | — | Array of GPS records | No |
| GET | `/GetAllAdvancefence` | List all advance fences for a user with nested fences | `?UserId` | `{success, data[]}` | No |
| GET | `/DeleteFenceById` | Delete advance fence and all child `tblfence` rows | `?id` | `{success, message}` | No |
| POST | `/SaveFenceByIdNew` | Create or update an advance fence with device list | `{name, IdAdvanceFence, selectedlist[], lat, lng, fencedraw, range, status, idapp}` | `{success, message}` | **JWT** |
| POST | `/updateAdvanceFence` | Update existing advance fence geometry | `{objFence}` | `{success, message}` | **JWT** |
| GET | `/GetFenceById` | Get single fence record by ID | `?id` | `{success, data}` | No |
| POST | `/UpdateFenceNameById` | Rename a fence | `{id, name}` | `{success, message}` | No |
| GET | `/ChangeFenceByBike` | Change fence assignment for a device | `?DeviceId, ?FenceId` | `{success, message}` | No |

### Per-Device Fence (`petFence.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllFence` | List all fence records | — | Array | No |
| GET | `/IsPetInFence` | Check if lat/lng point is inside device's fence | `?deviceId, ?lat, ?lng` | `{success, message}` | No |
| GET | `/GetFenceByPet` | Get fence record for a device | `?deviceId` | `{success, data}` | No |
| GET | `/GetAllFenceByVehicle` | List all fences for a device | `?deviceId` | `{success, data[]}` | No |
| GET | `/GetFenceById` | Get fence by primary key | `?idFence` | `{success, data}` | No |
| POST | `/SaveFence` | Create or update per-device fence | `{deviceId, name, lat, lng, fencedraw, range, status}` | `{success, message}` | No |
| POST | `/SaveFenceById` | Create/update fence for specific device with GPS check | `{deviceId, name, lat, lng, fencedraw, range, status}` | `{success, message}` | No |
| POST | `/UpdateFenceNameById` | Rename a fence | `{id, name}` | `{success, message}` | No |
| GET | `/DeleteFence` | Delete fence by deviceId | `?deviceId` | `{success, message}` | No |
| GET | `/DeleteFenceById` | Delete fence by primary key | `?id` | `{success, message}` | No |
| GET | `/GetFencedeivce` | Get device info by fence | `?deviceId` | `{success, data}` | No |

### Journey (`journey.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/getAllCompletedJourney` | List completed journeys with user info | `?DeviceId, ?UserId` | Array of journey routes | No |
| GET | `/GetDeviceJourney` | List journeys for device with date range | `?DeviceId, ?UserId, ?StartDate, ?EndDate` | Array with vehicle name | No |
| GET | `/GetDeviceLastJourney` | Get currently active (open) journey | `?DeviceId, ?UserId` | `{success, data}` | No |
| POST | `/StartJourney` | Toggle journey: start new or stop active | `{DeviceId, UserId, JourneyName}` | `{success, message}` | **JWT** |
| GET | `/deleteJourneyById` | Soft-delete journey (sets IsDelete=1) | `?Id` | `{success, message}` | **JWT** |
| GET | `/ExportReport` | Export GPS track data as XLSX | `?DeviceId, ?TodayStartDateTime, ?TodayEndDateTime, ?TimeZone` | `.xlsx` file download | No |

### Route Plan (`routeplan.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllRouteByUserId` | List all routes with devices and markers | `?UserId` or `?Id` | Array of route objects | No |
| POST | `/SaveRoutePlan` | Create new route plan with devices and markers | `{objRoute, selectedlist[], objMarkerPin[]}` | `{success, message}` | **JWT** |
| POST | `/updateRoutePlan` | Full update of route plan metadata and markers | `{objRoute, selectedlist[], objMarkerPin[]}` | `{success, message}` | **JWT** |
| GET | `/DeleteRouteById` | Cascade delete route, devices, markers | `?Id` | `{success, message}` | **JWT** |
| POST | `/SaveRoutemarker` | Create or update a single route marker | `{Id, MarkerName, Lat, Lng, IdRoute}` | `{success, message}` | **JWT** |
| GET | `/DeleteRoutemarker` | Delete a route marker by ID | `?Id` | `{success, message}` | **JWT** |

### Favourite Place (`favoriteplace.js`)

| Method | Endpoint | Description | Request Params/Body | Response | Auth |
|---|---|---|---|---|---|
| GET | `/GetAllFavoritePlaceByDevice` | List favourite places for a device | `?DeviceId` | `{success, data[]}` | No |
| GET | `/GetFavoritePlaceById` | Get single favourite place | `?id` | `{success, data}` | No |
| POST | `/SaveFavoritePlace` | Create favourite place with live inside/outside status | `{DeviceId, Name, Latitude, Longitude, Range}` | `{success, message}` | No |
| GET | `/DeleteFavoritePlace` | Hard-delete favourite place | `?id` | `{success, message}` | No |
| POST | `/UpdateFavoritePlaceNameById` | Rename a favourite place | `{id, Name}` | `{success, message}` | No |

---

## 6. Database Interactions

### Models Used

| Model | Table | Description |
|---|---|---|
| `tbladvancefence` | `tbladvancefence` | Named fence groups owned by a user; has-many `tblfence` |
| `tblfence` | `tblfence` | Per-device geofence with geometry, shape type, and inside/online flags; FK `IdAdvanceFence` |
| `tbljourneygpsdata` | `tbljourneygpsdata` | GPS waypoints captured during a journey; FK `IdJourneyRoute` |
| `tbljourneyroute` | `tbljourneyroute` | Journey header: device, user, start/end time, total km, name, soft-delete flag |
| `tblfavoriteplace` | `tblfavoriteplace` | Named saved locations with radius and inside-flag per device |
| `tblroute` | `tblroute` | Route plan header |
| `tblroutedevice` | `tblroutedevice` | Junction table: route ↔ device |
| `tblroutemarker` | `tblroutemarker` | Named waypoint pins for a route |
| `tblvehicle` | `tblvehicle` | Vehicle/device registry; `IsInFence` flag updated on fence save |
| `tbluserinformation` | `tbluserinformation` | User accounts for JWT authentication |
| `tblgpsdata` | `tblgpsdata` | Raw GPS data used for fence evaluation and report export |
| `tblappinfo` | `tblappinfo` | App registry; used to resolve `idApp` for Maark app |

### Key Query Patterns

| Operation | Method | Notes |
|---|---|---|
| Fence containment check | `geolib.isPointInCircle` / `isPointInside` | Uses latest position from Redis cache; falls back to DB |
| Bulk device fence create | Raw SQL `INSERT INTO tblfence ... VALUES ?` | Batch insert via `connection.query` |
| Bulk route device create | Raw SQL `INSERT INTO tblroutedevice ... VALUES ?` | Batch insert via `connection.query` |
| Bulk marker create | Raw SQL `INSERT INTO tblroutemarker ... VALUES ?` | Batch insert via `connection.query` |
| Journey toggle | `findOne` then `updateAttributes` or `create` | Single atomic pattern per device |
| Journey soft-delete | `updateAttributes({ IsDelete: 1 })` | Not a hard delete |
| GPS export | Raw SQL on `tblgpsdata` with Unix timestamp range | Bypasses Sequelize for performance |
| Redis cache | `client.get(DeviceId)` / `client.set(DeviceId, JSON)` | Used for real-time fence and favourite-place checks |

---

## 7. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Missing or invalid JWT | Returns `InvalidToken` JSON object (global constant) |
| User not found after JWT decode | Returns `InvalidToken` |
| Journey record not found for delete | Returns `RecordNotFound` JSON constant |
| No open journey when starting | Creates a new journey (toggle semantics) |
| Duplicate favourite place (same DeviceId + Name) | `findOrCreate` returns existing record; no duplicate created |
| Duplicate alarm / fence per device | `findOrCreate` pattern prevents duplicate creation |
| Redis unavailable or empty | `GetdbCurrentLocation()` fallback queries `tblgpsdata` |
| GPS data not found in DB | Returns `RecordNotFound` |
| Empty `selectedlist` for route plan | Response: `{success: false, message: 'Route Plan not created...'}` |
| Empty marker list in route plan | Route device assignment succeeds without markers (graceful skip) |
| Advance fence `IdAdvanceFence` not found | New `tbladvancefence` record created |
| `GetDeviceJourney` with no `EndTime` | Only records with `EndTime IS NOT NULL` returned (excludes active journey) |
| `ExportReport` empty result set | Excel file generated with header row only; no error thrown |
| DB error on bulk insert | `err` checked in callback; `{success: false}` returned |
| Route delete — no records in junction tables | `destroy` resolves with `0`; parent route delete still proceeds |
| `updateRoutePlan` success flag bug | Returns `{success: false, message: 'Route Plan updated successfully..'}` — note: `success` field is incorrectly set to `false` on success in one branch |
