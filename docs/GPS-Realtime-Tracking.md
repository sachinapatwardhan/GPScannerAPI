# GPS Real-Time Tracking

## Table of Contents

1. [Module Purpose](#1-module-purpose)
2. [Business Workflow (Step-by-Step)](#2-business-workflow-step-by-step)
3. [Actor Interactions](#3-actor-interactions)
4. [Validation Rules](#4-validation-rules)
5. [API Endpoints](#5-api-endpoints)
   - [REST Endpoints — GPS Data Retrieval](#51-rest-endpoints--gps-data-retrieval)
   - [REST Endpoints — Device Commands (MyPin Protocol)](#52-rest-endpoints--device-commands-mypin-protocol)
   - [REST Endpoints — Device Commands (Concox Protocol)](#53-rest-endpoints--device-commands-concox-protocol)
   - [REST Endpoints — Device Commands (Beidou Protocol)](#54-rest-endpoints--device-commands-beidou-protocol)
   - [REST Endpoints — Map / Report Data](#55-rest-endpoints--map--report-data)
   - [REST Endpoints — Utility / IMEI Management](#56-rest-endpoints--utility--imei-management)
   - [TCP Socket Protocol](#57-tcp-socket-protocol)
   - [Socket.io Events](#58-socketio-events)
6. [Database Interactions](#6-database-interactions)
7. [Edge Cases & Error Handling](#7-edge-cases--error-handling)

---

## 1. Module Purpose

The GPS Real-Time Tracking module is the core data pipeline of the **GPScannerAPI / Maark** platform. It is responsible for:

- **Receiving** raw binary GPS packets from physical tracking devices over persistent TCP connections.
- **Parsing and normalising** location data across three distinct hardware protocols.
- **Persisting** every GPS fix to a MySQL database.
- **Caching** the latest known position per device in Redis so clients never have to hit the database for a real-time lookup.
- **Broadcasting** location updates, device-status changes, alarms, and driving events to connected web and mobile clients in real time via Socket.io.
- **Sending configuration commands** back to devices (speed limits, arm/disarm, relay control, odometer seeding, GPRS intervals, etc.).

### Controllers Involved

| File | Route Prefix | Responsibility |
|------|-------------|----------------|
| `controllers/socketapi.js` | `/socketapi` | MyPin (4040 protocol) GPS parsing, command dispatch, push notifications, CRC utilities, IMEI management |
| `controllers/socketapi_concox.js` | `/socketapi_concox` | Concox (7878 protocol) GPS/alarm/heartbeat parsing and command dispatch |
| `controllers/socketapi_beidou.js` | `/socketapi_beidou` | Beidou (7E protocol) GPS parsing and command dispatch |
| `controllers/gpsdata.js` | `/gpsdata` | Historical GPS data retrieval, report generation, data deletion |
| `controllers/lastGPSdata.js` | `/lastGPSdata` | Latest cached GPS fix per device (API-key authenticated) |
| `controllers/MapData.js` | `/MapData` | Map view helpers: path tracing, fence management, canvas/driving data, export |

### Supported GPS Device Protocols

| Protocol | Framing | Identifier | CRC Algorithm | Typical Use |
|----------|---------|-----------|---------------|-------------|
| **MyPin** (GT series) | `4040` prefix, `0D0A` terminator | Command code at bytes 22-26 | CRC-16/X25 (`crc16x25`) | GT06-class hardwired trackers |
| **Concox** | `7878` / `7979` prefix, `0D0A` terminator | Message type at byte 6-8 | CRC-16/X25 | JC series, Concox OBD trackers |
| **Beidou** | `7E` start/stop delimiter | Command at bytes 0-8 | XOR of all body bytes | Chinese Beidou protocol trackers |

---

## 2. Business Workflow (Step-by-Step)

### Phase 1 – Device Connects (TCP Handshake)

1. A GPS device opens a persistent raw TCP connection to the server on the port defined by `process.env.SocketPort`.
2. The device sends a **Login / Registration packet**:
   - MyPin: `40400012{DeviceId}400001{CRC}0D0A` — handled by `Command5000` (command code `400001`).
   - Concox: `7878{len}01{DeviceId}{SN}{CRC}0D0A` (message type `0x01`).
   - Beidou: `7E8100{len}{DeviceId}{SN}{CRC}7E`.
3. The server looks up the device in `tblgpsdevice`, acknowledges the packet, and records the connection.
4. The device's socket address (IP + port) is stored in Redis under the key `{DeviceId}SocketConnection` so that downstream command senders can reach the device directly.

### Phase 2 – Heartbeat / Keepalive

1. At regular intervals the device sends a **Heartbeat packet**:
   - MyPin: command code `400001` — handled by `Command5001`.
   - Concox: message type `0x23` — handled by `CommandConcoxHeartBeat`.
2. On receipt the server:
   - Inserts a row into `tblhandshake` (`DeviceId`, `Datetime`).
   - Executes `UPDATE tblvehicle SET HandshakDatetime=?, IsOnline=true WHERE deviceid=?`.
   - Sets Redis key `{DeviceId}Online = "true"`.
   - For Concox, additionally caches: `{DeviceId}ACC`, `{DeviceId}PowerCutOff`, `{DeviceId}BatteryPercentage`, `{DeviceId}GPSTracking`, `{DeviceId}Charging`.
   - Emits `BikeDeviceStatus` and `{DeviceId}BikeDeviceStatus` Socket.io events to notify all connected clients that the device is online.

### Phase 3 – GPS Data Packet Received

1. The external TCP socket server parses the raw bytes and forwards the structured data to this API server via a Socket.io **inbound** event (`Command9955` for MyPin, `CommandConcoxGPS` for Concox).
2. The corresponding global handler (`Command9955`, `CommandConcoxGPS`, `CommandBeidouGPS`) is invoked.

#### MyPin Packet Parsing (`Command9955`)

The raw hex string is decoded field-by-field using substring offsets:
- `line[0:4]` — protocol start marker `4040`.
- `line[8:22]` — 14-digit Device ID (last 14 digits of IMEI).
- Latitude / Longitude arrive pre-decoded in decimal degrees from the external socket server (`deg_to_lat_long` converts NMEA DDmm.mmm format → decimal).
- Speed in km/h (integer).
- Direction in degrees (0–360).
- Input/output status byte — decoded bit-by-bit to boolean status flags.
- Unix timestamp (`Date` field, stored as BIGINT).

#### Concox Packet Parsing (`CommandConcoxGPS`)

All values are read as big-endian hex substrings:
- `line[8:20]` — 6-byte BCD date/time: `YY MM DD HH mm ss`.
- `line[22:30]` — Latitude raw integer → `convert_lat_long_format` → `deg_to_lat_long`.
- `line[30:38]` — Longitude raw integer → same conversion.
- `line[38:40]` — Speed (1 byte, hex → decimal km/h).
- `line[40:44]` — Course/Status word (2 bytes) → `hexToBinary` → bit flags:
  - Bit 3: GPS fix valid (`A`) or invalid (`V`).
  - Bit 5: Latitude hemisphere (`N`/`S`).
  - Bit 4: Longitude hemisphere (`E`/`W`).
  - Bit 2: Real location (`AD1=0`) or LBS (`AD1=1`).
  - Bits 6–15: Heading (0–360°, unsigned).
- DateTime converted to UTC+8 then to Unix timestamp.

#### Beidou Packet Parsing

Frames are delimited by `7E` start/stop bytes. Body fields use the JT/T808 message structure:
- Message ID at bytes 0-4.
- Device ID (BCD-encoded) at bytes 4-16.
- Latitude and Longitude as 32-bit fixed-point integers.
- CRC is XOR of all body bytes (single byte).

### Phase 4 – Data Enrichment & Status Logic

Before writing to the database the handler:

1. **Over-speed check**: reads `{DeviceId}MaxSpeed` from Redis; sets `IsOverSpeed = true` if current speed exceeds it.
2. **Engine status**: reads `{DeviceId}EngineStatus1` from Redis and compares to current `IsEngine` flag. If changed, inserts an alarm row into `tblalarm` with alarm code `07` (ignition off) or `08` (ignition on), then sends push notifications and Socket.io `DeviceAlarm` / `DeviceNotificationCount` events.
3. **Idle detection**: in-memory object `ObjMyPinIdle[DeviceId]` tracks whether the vehicle has been stationary with engine on; alarm code `84` is triggered when idle time exceeds the configured threshold.
4. **Geo-fence evaluation**: current coordinates are tested against all configured fences for the vehicle using the `geolib` library. In/out transitions trigger fence alarm records and push notifications.
5. **Project Ignition Status**: reads Redis key `{DeviceId}ProjectIgnitionStatus`. If `"false"`, the record is skipped entirely (device is administratively suppressed).

### Phase 5 – Persistence

1. Inserts a row into `tblgpsdata` (all fields, see [Database Interactions](#6-database-interactions)).
2. Inserts a row into `tblgpsdate` (`DeviceId`, `GPSDate`) for date-partitioned lookups.
3. Updates `tblvehicle` with latest position, odometer, online status, and ignition state.

### Phase 6 – Redis Cache Update

After a successful DB write:
```
client.set(DeviceId, JSON.stringify(objConnection))   // latest GPS fix
client.set(DeviceId + "EngineStatus1", ...)            // ignition state
```
The cached GPS object contains: `Deviceid`, `Position`, `Speed`, `Latitude`, `Longitude`, `Direction`, `IsEngine`, `OdoMeter`, `Date`, and all boolean status flags.

### Phase 7 – Real-Time Broadcast

The server emits on the following Socket.io channels:
- `{DeviceId}BikeRoute` — GPS fix payload broadcast to all subscribers of that device.
- `AllBikeRouteHook` — same payload broadcast to journey-report service hooks.
- `{DeviceId}BikeDeviceStatus` — online/offline + ACC/battery status.
- `{userId}DeviceAlarm` — alarm events targeted by user ID.
- `{userId}DeviceNotificationCount` — unread notification count update.
- `{DeviceId}canbusdata` / `{DeviceId}drivingdata` — CAN-bus and driving behaviour events.

### Phase 8 – Server-to-Device Commands

When an operator triggers a command (e.g., relay cut, speed limit change) via the REST API:
1. The handler reads `{DeviceId}SocketConnection` from Redis to find the device's current TCP server IP and port.
2. A `net.Socket` client connects to that address and writes the command packet in hex.
3. A 10-second timeout is set; if no ACK is received the callback returns an error.
4. On a successful ACK the database and Redis are updated (e.g., `tblvehicle.MaxSpeed`, `tblvehicle.Relay`).

---

## 3. Actor Interactions

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          GPS Tracking Data Flow                              │
└──────────────────────────────────────────────────────────────────────────────┘

  [GPS Device]
  (MyPin / Concox / Beidou)
        │  Raw TCP binary packets
        │  (Login, Heartbeat, GPS, Alarm, CAN-bus, Driving)
        ▼
  [External TCP Socket Server]        ◄── Device management TCP port
  (separate process / service)             (SocketPort env var)
        │  Socket.io inbound events
        │  (Command9955, CommandConcoxGPS,
        │   CommandConcoxAlarm, CommandConcoxHeartBeat,
        │   Command9901, Command9902, UpdateDeviceStatusNewSocket)
        ▼
  [GPScannerAPI / server.js]
  Socket.io server (APIPort)
        │
        ├──► [Command9955 / CommandConcoxGPS / CommandBeidouGPS]
        │         │  Enrichment: over-speed, ignition change,
        │         │              idle detection, geo-fence check
        │         │
        │         ├──► [MySQL / tblgpsdata]   INSERT GPS fix
        │         ├──► [MySQL / tblgpsdate]   INSERT date record
        │         ├──► [MySQL / tblalarm]     INSERT alarm (if triggered)
        │         ├──► [MySQL / tblvehicle]   UPDATE online status
        │         ├──► [Redis]                SET latest fix cache
        │         │
        │         └──► [Socket.io broadcast]
        │                   {DeviceId}BikeRoute
        │                   {DeviceId}BikeDeviceStatus
        │                   {userId}DeviceAlarm
        │                   {userId}DeviceNotificationCount
        │                   AllBikeRouteHook
        │
        └──► [Push Notification Service]
                  Firebase FCM / APNs (iOS & Android)
                  PWA Web Push

  [Web / Mobile Clients]
        │  Subscribe to Socket.io events
        │  Poll REST endpoints for historical data
        ▼
  GET /lastGPSdata/getlastgpsdata   ← latest position (Redis-backed)
  GET /gpsdata/GetAllGpsData        ← historical with pagination
  GET /MapData/GetPath              ← route polyline for map
  GET /MapData/GetFenceByPet        ← geo-fence boundaries

  [Operator / Admin]
        │  REST command endpoints
        ▼
  GET /socketapi/SendSpeedData       → MyPin device command
  GET /socketapi_concox/EngineCutOff → Concox device command
  GET /socketapi_beidou/SetRelaySetting → Beidou device command
```

### Redis Key Reference

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `{DeviceId}` | JSON string | Latest GPS fix object |
| `{DeviceId}SocketConnection` | JSON string | `{IP, Port}` of device's TCP server |
| `{DeviceId}Online` | `"true"` / `"false"` | Real-time online flag |
| `{DeviceId}EngineStatus1` | JSON string | `{IsEngine, Date}` — last known ignition state |
| `{DeviceId}ACC` | `"true"` / `"false"` | Accessory/ignition (Concox heartbeat) |
| `{DeviceId}PowerCutOff` | `"true"` / `"false"` | External power cut flag |
| `{DeviceId}BatteryPercentage` | hex string | Battery voltage level code |
| `{DeviceId}GPSTracking` | `"true"` / `"false"` | GPS fix active flag |
| `{DeviceId}Charging` | `"true"` / `"false"` | Charging status |
| `{DeviceId}MaxSpeed` | string (number) | Configured maximum speed for over-speed check |
| `{DeviceId}MaxSpeedAlarm` | JSON string | `{Speed, IsSpeedAlert, IsOverSpeed}` |
| `{DeviceId}Relay` | integer | Current relay (engine cut) state |
| `{DeviceId}IgnitionStatus` | `"true"` / `"false"` | User notification preference for ignition alarms |
| `{DeviceId}EmailNotificationSend` | `"true"` / `"false"` | Email alert preference |
| `{DeviceId}ProjectIgnitionStatus` | `"true"` / `"false"` | Whether GPS data recording is active |

---

## 4. Validation Rules

### IMEI / Device ID Validation

- Device IDs are derived from the last **14 digits** of the 15-digit IMEI: `IMEI.toString().substring(IMEI.length - 14)`.
- Generated IMEIs must: be exactly 15 digits, not start with `0`, not start with `35`, and have no character repeated three or more times consecutively (regex: `/^((?!(0))(?!(.0))(?!(..0))[0-9]{15})$/`).
- The `/socketapi/RequestIMEINumberbyUDID` endpoint checks `tbliosimeinumbermapping` to prevent duplicate IMEI assignment per device UDID.

### GPS Fix Validity

- MyPin/Concox: `Position = "V"` (void) means no GPS fix. Only fixes with `Position = "A"` are cached to Redis as the current position.
- Concox: bit 3 of the `CourseStatus` word must be `1` for a valid fix.
- Beidou: fix validity is determined by the GPS position flag in the status byte.

### Coordinate Conversion

NMEA DDmm.mmmm format is converted to decimal degrees via `deg_to_lat_long(deg, Direction)`:
1. Extract degrees: all digits before the last `XX.XXXX` minutes portion.
2. Extract minutes: last portion after `indexOf('.') - 2`.
3. Attempt `geolib.useDecimal(degree° mm' ss" Direction)`.
4. Fallback: `decimal = parseFloat(degree) + parseFloat(minutes) / 60`; negate if `S` or `W`.

### Time Validation

For Concox packets, a time-difference check is performed against server time:
```javascript
var timediffernce = parseInt((DeviceTime - systemtime) / 1000);
```
Packets more than 1 hour in the future are flagged (though the limit comment shows `3600` seconds). Device timestamps use UTC+8 offset.

### API Authentication (`/lastGPSdata`)

The `getlastgpsdata` endpoint validates:
1. `Token` + `Key` query parameters are matched against `tblapiaccessclient` with `IsActive = 1`.
2. `DeviceId` must appear in `AccessClientExist.DeviceId` (comma-separated allowed device list).
3. Failure returns `{ success: false, message: "Invalid Token/Key." }` or `"Invalid DeviceId."`.

### Packet CRC Verification

| Protocol | Algorithm | Implementation |
|----------|-----------|---------------|
| MyPin | CRC-16/X25 | `CalculateCRCbyHex(hex)` — uses `crc.crc16x25(byteArray)`, output as 4-char hex |
| Concox | CRC-16/X25 | Same `CalculateCRCbyHex` function |
| Beidou | XOR checksum | `CalculateBeidouCRC(hex)` — XOR of all ASCII chars of the hex-decoded string, output as 2-char hex |

### Over-Speed Detection

```javascript
if (Speed > parseFloat(strSpeed)) {   // strSpeed from Redis key {DeviceId}MaxSpeed
    IsOverSpeed = true;
}
```
`IsOverSpeed` is persisted in `tblgpsdata.IsOverSpeed` and included in the Socket.io broadcast.

---

## 5. API Endpoints

### 5.1 REST Endpoints — GPS Data Retrieval

| Method | Endpoint | Description | Query Parameters | Response | Auth |
|--------|----------|-------------|-----------------|----------|------|
| `GET` | `/lastGPSdata/getlastgpsdata` | Returns the most recent GPS fix for a device from Redis cache | `Token`, `Key`, `DeviceId` | `{ success, message, data: { Deviceid, GPSDate, Latitude, Longitude, Speed, Position, Direction, EngineStatus, OdoMeter } }` | API Token+Key |
| `GET` | `/gpsdata/GetAllGpsData` | Paginated historical GPS data (DataTables format, raw SQL on report DB) | `columns[]`, `order[]`, `search`, `DeviceId`, `StartDate`, `EndDate`, `idApp`, `start`, `length`, `draw` | DataTables JSON (`draw`, `recordsTotal`, `recordsFiltered`, `data[]`) | Session |
| `GET` | `/gpsdata/GetAllGpsDataOld` | Legacy paginated GPS data (Sequelize ORM) | Same as above | Same format | Session |
| `GET` | `/gpsdata/GetAllGpsDataNew` | Paginated GPS data from `tblgpsdata2` (uses `SQL_CALC_FOUND_ROWS`) | `columns[]`, `order[]`, `search`, `DeviceId`, `StartDate`, `EndDate`, `AppName`, `start`, `length`, `draw` | DataTables JSON | Session |
| `GET` | `/gpsdata/GetAllAlarm` | Paginated alarm history with vehicle join | `DeviceId`, `StartDate`, `EndDate`, `idApp`, `columns[]`, `order[]`, `start`, `length`, `draw` | DataTables JSON | Session |
| `GET` | `/gpsdata/GetAllAlarmNew` | Paginated alarm history from `tblgpsdevice` join | Same as above + `AppName` | DataTables JSON | Session |
| `GET` | `/gpsdata/ExportAllGpsData` | Export full GPS history to CSV/Excel | `DeviceId`, `StartDate`, `EndDate`, `idApp` | File download | Session |
| `GET` | `/gpsdata/ExportAllGpsDataNew` | Export GPS history from `tblgpsdata2` | `DeviceId`, `StartDate`, `EndDate`, `AppName` | File download | Session |
| `GET` | `/gpsdata/ExportAlarm` | Export alarm history to CSV/Excel | `DeviceId`, `StartDate`, `EndDate` | File download | Session |
| `GET` | `/gpsdata/GetAllSpeedDataReport` | Speed report with journey segments | `DeviceId`, `StartDate`, `EndDate` | JSON array | Session |
| `GET` | `/gpsdata/ExportAllSpeedDataReport` | Export speed report | Same as above | File download | Session |
| `GET` | `/gpsdata/GetAllWoringHourForReport` | Working-hours report (trips + idle) | `DeviceId`, `StartDate`, `EndDate`, `idApp` | JSON array | Session |
| `GET` | `/gpsdata/GetAllWoringHourForReportNew` | Working-hours report from `tblgpsdata2` | `DeviceId`, `StartDate`, `EndDate`, `AppName` | JSON array | Session |
| `GET` | `/gpsdata/ExportAllWoringHourForReport` | Export working-hours report | Same | File download | Session |
| `GET` | `/gpsdata/ExportAllWoringHourForReportNew` | Export working-hours from new table | Same | File download | Session |
| `GET` | `/gpsdata/PrintAllWoringHourForReportNew` | Printable working-hours report | Same | HTML/JSON | Session |
| `GET` | `/gpsdata/GetAllEngineidleReport` | Engine idle time report | `DeviceId`, `StartDate`, `EndDate` | JSON array | Session |
| `GET` | `/gpsdata/GetAllDriverReport` | Driver behaviour report | `DeviceId`, `StartDate`, `EndDate`, `idApp` | JSON array | Session |
| `GET` | `/gpsdata/GetAllDriverReportNew` | Driver behaviour from `tblgpsdata2` | `DeviceId`, `StartDate`, `EndDate`, `AppName` | JSON array | Session |
| `GET` | `/gpsdata/ExportDriverReport` | Export driver report | Same | File download | Session |
| `GET` | `/gpsdata/ExportDriverReportNew` | Export driver report (new) | Same | File download | Session |
| `GET` | `/gpsdata/PrintDriverReportNew` | Print driver report | Same | HTML/JSON | Session |
| `POST` | `/gpsdata/GetAllJourneyRouteForReport` | Journey/trip route for date range | JSON body: `{ DeviceId, StartDate, EndDate }` | JSON array of trip segments | Session |
| `GET` | `/gpsdata/ExportAlljourneyReportNew` | Export journey report | `DeviceId`, `StartDate`, `EndDate` | File download | Session |
| `GET` | `/gpsdata/PrintJourneyReportNew` | Print journey report | Same | HTML/JSON | Session |
| `GET` | `/gpsdata/DeleteGPSdatabyVehicleId` | Schedule GPS data deletion for a vehicle | `VehicleId` | `{ success, message }` | Session |
| `GET` | `/gpsdata/DeleteAccount` | Delete user account and associated GPS data | `UserId` | `{ success, message }` | Session |
| `GET` | `/gpsdata/DeleteGPSDeleteById` | Remove a queued GPS-deletion job | `Id` | `{ success, message }` | Session |

> **Date parameter format**: All `StartDate` / `EndDate` params are expected in local time and are converted to Unix timestamps internally using `convertdateUTCformat`.

---

### 5.2 REST Endpoints — Device Commands (MyPin Protocol)

All endpoints under `/socketapi`. These endpoints open an outbound TCP connection to the device using the IP/port stored in Redis key `{DeviceId}SocketConnection`.

**MyPin packet structure**: `40400012{DeviceId}{CommandCode}{Payload}{CRC16X25}0D0A`  
**ACK detection**: response starts with `2424` and command code matches at bytes 22-26.

| Method | Endpoint | Description | Query Parameters | Response | Notes |
|--------|----------|-------------|-----------------|----------|-------|
| `GET` | `/socketapi/SendSpeedData` | Set maximum speed limit on device | `DeviceId`, `Speed` (km/h integer) | `{ success, message }` | Command code `4105`. On ACK `01`, updates `tblvehicle.MaxSpeed` and Redis `{DeviceId}MaxSpeed`. |
| `GET` | `/socketapi/SendMovementData` | Configure movement sensitivity threshold | `DeviceId`, `Movement` | `{ success, message }` | Command code `4106`. ACK byte `01` = success. Updates `tblvehicle.Movement`. |
| `GET` | `/socketapi/GetCurrentLocation` | Request an immediate GPS fix from device | `DeviceId` | `{ success, message }` | Command code `4101`. Packet: `40400011{DeviceId}4101{CRC}0D0A`. |
| `GET` | `/socketapi/SendCommandToDevice` | Send arbitrary raw hex command | `DeviceId`, `Command` | `{ success, message }` | Passes hex string directly. |
| `GET` | `/socketapi/SetGPRSInterval` | Set GPRS reporting interval | `DeviceId`, `TimeInterval` (seconds) | `{ success, message }` | Updates `tblvehicle.GPRSInterval`. |
| `GET` | `/socketapi/SetGPRSIntervalStopCar` | Set interval for stopped-vehicle state | `DeviceId`, `TimeInterval` | `{ success, message }` | |
| `GET` | `/socketapi/SetOutputControl` | Toggle relay/output pin | `DeviceId`, `Relay` (0 or 1) | `{ success, message }` | Updates `tblvehicle.Relay` and Redis `{DeviceId}Relay`. |
| `GET` | `/socketapi/SetArmSettings` | Arm / disarm alarm system | `DeviceId`, `Arm` | `{ success, message }` | |
| `GET` | `/socketapi/SetOdometerSetting` | Seed initial odometer value | `DeviceId`, `odometer` (metres) | `{ success, message }` | |
| `GET` | `/socketapi/SetTimeZone` | Configure device time zone | `DeviceId`, `TimeZone` | `{ success, message }` | |
| `GET` | `/socketapi/SetACCSetting` | Configure ACC (ignition) detection | `DeviceId`, settings | `{ success, message }` | |
| `GET` | `/socketapi/SetHeartBeatInterval` | Set heartbeat packet interval | `DeviceId`, `Interval` | `{ success, message }` | |
| `GET` | `/socketapi/SetSleepMode` | Configure device sleep mode | `DeviceId`, `SleepMode` | `{ success, message }` | |
| `GET` | `/socketapi/FectoryReset` | Factory-reset device settings | `DeviceId` | `{ success, message }` | |
| `GET` | `/socketapi/RebootDevice` | Reboot device remotely | `DeviceId` | `{ success, message }` | |
| `GET` | `/socketapi/ClearDataLogger` | Erase internal data logger | `DeviceId` | `{ success, message }` | |
| `GET` | `/socketapi/GetFirmWareVersion` | Request firmware version string | `DeviceId` | `{ success, data }` | |
| `GET` | `/socketapi/ReadGPRSTimeInterval` | Read current GPRS interval from device | `DeviceId` | `{ success, data }` | |
| `GET` | `/socketapi/ReadTroubleCode` | Read OBD trouble codes | `DeviceId` | `{ success, data }` | |
| `GET` | `/socketapi/ClearTroubleCode` | Clear OBD trouble codes | `DeviceId` | `{ success, message }` | |
| `GET` | `/socketapi/ReadVINCode` | Read vehicle VIN from OBD port | `DeviceId` | `{ success, data }` | |
| `GET` | `/socketapi/ReadRFIDTags` | Read paired RFID tags | `DeviceId` | `{ success, data }` | |
| `GET` | `/socketapi/MonitorVoice` | Activate audio monitoring (voice call) | `DeviceId` | `{ success, message }` | |
| `GET` | `/socketapi/Command5000` | Simulate login handshake (debug) | `Code` (raw hex packet) | Raw hex ACK string | Returns `40400012{DeviceId}400001{CRC}0D0A` |
| `GET` | `/socketapi/CalculateCRCOnline` | Compute CRC-16/X25 for a hex string | `data` | CRC hex string | Utility / debug |

---

### 5.3 REST Endpoints — Device Commands (Concox Protocol)

All endpoints under `/socketapi_concox`.

**Concox packet structure**: `7878{len}{msgType}{DeviceId}{payload}{CRC}0D0A`

| Method | Endpoint | Description | Query Parameters | Response | Notes |
|--------|----------|-------------|-----------------|----------|-------|
| `GET` | `/socketapi_concox/SendSpeedData` | Set max speed on Concox device | `DeviceId`, `Speed` | `{ success, message }` | Reads/updates Redis `MaxSpeedAlarm` key. Persists to `tblvehicle.MaxSpeed`. |
| `GET` | `/socketapi_concox/EngineCutOff` | Cut / restore engine via relay | `DeviceId`, `IsEngineCutOff` (true/false) | `{ success, message }` | Sends `DYD,000000#` (cut) or `HFYD,000000#` (restore). ACK contains `DYD=Success!` / `HFYD=Success!`. Updates `tblvehicle.Relay`. |
| `GET` | `/socketapi_concox/CommandDeviceStatus` | Manually set device online/offline status | `DeviceId`, `Status` | `{ success, message }` | Updates `tblvehicle.IsOnline` and Redis `{DeviceId}Online`. |

---

### 5.4 REST Endpoints — Device Commands (Beidou Protocol)

All endpoints under `/socketapi_beidou`.

**Beidou packet structure**: `7E{msgId}{DeviceId}{SN}{payload}{XOR_CRC}7E`  
**ACK detection**: `response[34:36] == "00"` indicates success.

| Method | Endpoint | Description | Query Parameters | Response | Notes |
|--------|----------|-------------|-----------------|----------|-------|
| `GET` | `/socketapi_beidou/SendSpeedData` | Set max speed on Beidou device | `DeviceId`, `Speed` | `{ success, message }` | Message ID `8103`, parameter `0x00a4`, value as 4-byte big-endian hex. Updates `tblvehicle.MaxSpeed`. |
| `GET` | `/socketapi_beidou/SetArmSettings` | Arm (`11`) or disarm (`12`) alarm | `DeviceId`, `Arm` (0/1/2) | `{ success, message }` | Message ID `8105`, parameter `0x00a1`. `Arm=2` checks engine state first. Updates `tblvehicle.Arm` and `tblvehicle.LastArmSetting`. |
| `GET` | `/socketapi_beidou/SetOdometerSetting` | Seed odometer (metres) | `DeviceId`, `odometer` | `{ success, message }` | Message ID `8103`, parameter `0x00aa`, value as 4-byte big-endian hex. Updates `tblvehicle.OdoMeter`. |
| `GET` | `/socketapi_beidou/SetRelaySetting` | Control relay output | `DeviceId`, `Relay` (hex integer) | `{ success, message }` | Message ID `8500`. ACK `response[2:6] == "0500"`. Updates `tblvehicle.Relay` and Redis `{DeviceId}Relay`. |

---

### 5.5 REST Endpoints — Map / Report Data

All endpoints under `/MapData`.

| Method | Endpoint | Description | Query Parameters | Response | Auth |
|--------|----------|-------------|-----------------|----------|------|
| `GET` | `/MapData/GetAllBike` | List all vehicles for the current user | (session user) | JSON array of vehicles | Session |
| `POST` | `/MapData/GetPath` | Get GPS track for a time window (map route) | JSON body: `{ DeviceId, StartDate, EndDate }` | JSON array of `{ Latitude, Longitude, Speed, Date, ... }` | Session |
| `GET` | `/MapData/ExportReport` | Export GPS track to file | `DeviceId`, `StartDate`, `EndDate` | File download | Session |
| `GET` | `/MapData/ExportReportNew` | Export GPS track (new table) | Same | File download | Session |
| `GET` | `/MapData/GetNotification` | Fetch alarm/notification list | `UserId` | JSON array | Session |
| `POST` | `/MapData/SaveFence` | Create or update a geo-fence | JSON body: fence definition `{ name, type, coordinates, DeviceId, ... }` | `{ success, message }` | Session |
| `GET` | `/MapData/GetFenceByPet` | Get all fences for a device | `DeviceId` | JSON array of fence objects | Session |
| `GET` | `/MapData/GetAllCanvasData` | Canvas / heatmap data | `DeviceId`, `Date` | JSON array | Session |
| `GET` | `/MapData/GetAllDrivingData` | Driving behaviour events for map overlay | `DeviceId`, `StartDate`, `EndDate` | JSON array | Session |
| `GET` | `/MapData/DeleteFence` | Remove a geo-fence | `FenceId` | `{ success, message }` | Session |

---

### 5.6 REST Endpoints — Utility / IMEI Management

| Method | Endpoint | Description | Query Parameters | Response |
|--------|----------|-------------|-----------------|----------|
| `GET` | `/socketapi/RequestIMEINumberbyUDID` | Assign (or look up) an IMEI for an iOS UDID | `UDID` | `{ IMEI }` |
| `GET` | `/socketapi/RequestIMEINumberForAndroid` | Assign (or look up) an IMEI for an Android device | `UDID`, `IMEI` | `{ IMEI }` |
| `GET` | `/socketapi/GenerateIMEI` | Batch-generate 10,000 valid IMEI numbers into DB | (none) | `"Success"` |
| `GET` | `/socketapi/GetCenterByGPS` | Compute centroid for a set of coordinates | `DeviceId` | `{ lat, lng }` |
| `GET` | `/socketapi/TestDegree` | Debug: test NMEA → decimal conversion | (none) | Raw text |
| `GET` | `/socketapi/SendFCMPush` | Send test FCM push notification | `Token` | `"Done"` |
| `GET` | `/socketapi/SendIOSPush` | Send test APNs push notification | `Token` | `"Done"` |
| `GET` | `/socketapi/SendPushTest` | Test push for a user | `UserId` | `"Done"` |

---

### 5.7 TCP Socket Protocol

The GPS devices communicate over a **persistent raw TCP connection** to a separate socket-server process. That server parses the binary frames and forwards structured data to this Node.js API server via Socket.io.

#### MyPin Protocol Frame Format

```
Byte offset  Length  Field
0-3          2 bytes  Start marker: 0x40 0x40 (ASCII "@@")
4-7          2 bytes  Packet length (big-endian, counts bytes from length to 0x0D0A)
8-21         7 bytes  Device ID (14 hex chars = last 14 digits of IMEI)
22-25        2 bytes  Command / message type code
26-N         N bytes  Payload (varies by command)
N+0          2 bytes  CRC-16/X25 of bytes from start to end of payload
N+2          2 bytes  Terminator: 0x0D 0x0A (CRLF)
```

Key command codes:

| Code | Direction | Description |
|------|-----------|-------------|
| `400001` | Device→Server | Login / heartbeat |
| `9955` | Device→Server | GPS location data |
| `9901` | Device→Server | CAN-bus data |
| `9902` | Device→Server | Driving behaviour |
| `4101` | Server→Device | Get current location |
| `4105` | Server→Device | Set max speed |
| `4106` | Server→Device | Set movement sensitivity |

Server ACK format: `40400012{DeviceId}400001{CRC}0D0A`

#### Concox Protocol Frame Format

```
Byte offset  Length  Field
0-1          1 byte   Start marker(s): 0x78 0x78 (short) or 0x79 0x79 (long)
2-3          1-2 bytes Packet length
4-5          1 byte   Message type
6-N          N bytes  Payload
N+0          2 bytes  Serial number
N+2          2 bytes  CRC-16/X25
N+4          2 bytes  Terminator: 0x0D 0x0A
```

Key message types (as hex):

| Type | Description | Handler |
|------|-------------|---------|
| `0x01` | Login (device registration) | Handshake |
| `0x10` | GPS location packet | `CommandConcoxGPS` |
| `0x11` | GPS alarm packet | `CommandConcoxAlarm` |
| `0x13` / `0x23` | Heartbeat | `CommandConcoxHeartBeat` |
| `0x80` | Server→Device command | Engine cut, speed set |

GPS packet payload (`0x10`) field layout (line substring offsets in hex string form):

| Offset (chars) | Field |
|----------------|-------|
| 8–19 | Date/time: `YYMMDDHHMMSS` (BCD) |
| 20–21 | Satellite count |
| 22–29 | Latitude (32-bit integer, minutes × 30000) |
| 30–37 | Longitude (32-bit integer, minutes × 30000) |
| 38–39 | Speed (km/h) |
| 40–43 | Course/status (bearing bits 6-15, status flags bits 0-5) |

#### Beidou Protocol Frame Format

```
Byte    Field
0       Start flag: 0x7E
1-2     Message ID (e.g., 0x0200 = GPS report)
3-4     Body length
5-10    Device ID (BCD-encoded, 6 bytes)
11-12   Serial number
13-N    Message body
N+1     XOR checksum of bytes 1 to N
N+2     End flag: 0x7E
```

CRC algorithm:
```javascript
function CalculateBeidouCRC(hex) {
    var str = hex2a(hex);        // hex string → ASCII
    let cs = 0;
    for (let char of str) cs ^= char.charCodeAt(0);
    return ('00' + cs.toString(16)).slice(-2);
}
```

---

### 5.8 Socket.io Events

The Socket.io server listens on the same port as the HTTP API (`process.env.APIPort`).

#### Inbound Events (Client/Socket-Server → API Server)

| Event | Payload | Handler | Description |
|-------|---------|---------|-------------|
| `Command9955` | GPS data object (`DeviceId`, `Latitude`, `Longitude`, `Speed`, `Direction`, `IsEngine`, `Date`, ...) | `Command9955()` | MyPin GPS position update |
| `GPSDATA` | Same GPS object | Broadcast only | Philippines-region device GPS data |
| `Command9901` | CAN-bus data object | `Command9901()` | CAN-bus diagnostic data |
| `Command9902` | Driving behaviour object | `Command9902()` | Driving event (harsh brake, acceleration, etc.) |
| `CommandConcoxGPS` | JSON string with `{ DeviceId, line }` | `CommandConcoxGPS()` | Concox GPS packet |
| `CommandConcoxAlarm` | JSON string with `{ DeviceId, line }` | `CommandConcoxAlarm()` | Concox alarm packet |
| `CommandConcoxHeartBeat` | JSON string with `{ DeviceId, line }` | `CommandConcoxHeartBeat()` | Concox heartbeat |
| `CommandDeviceStatus` | JSON string with `{ DeviceId, Status }` | `CommandDeviceStatus()` | Device online/offline state change |
| `UpdateDeviceStatusNewSocket` | `{ DeviceId, Status, ... }` | Broadcast + DB update | Device status update from new socket server |
| `DeviceAlarm` | Alarm object | Email notification + broadcast | Alarm event from new socket server |
| `JourneyRouteComplete` | `DeviceId` string | Broadcast | Journey/trip recording completed |
| `SimDetail` | SIM data object | Broadcast | SIM card information update |
| `emit_from_client` | any | Echo back | General echo channel |

#### Outbound Events (API Server → Connected Clients)

| Event | Payload | Description |
|-------|---------|-------------|
| `{DeviceId}BikeRoute` | Full GPS fix object | Real-time position update for a specific device |
| `AllBikeRouteHook` | Full GPS fix object | Broadcast to all journey-report service hooks |
| `{DeviceId}BikeDeviceStatus` | `{ DeviceId, Status, IsACC, VoltageLevel, IsCharging, IsGPSTracking }` | Device online/heartbeat status change |
| `BikeDeviceStatus` | Same as above | Broadcast to all clients (legacy) |
| `{userId}DeviceAlarm` | `{ AlarmCode, DeviceId, Datetime, Date, IdUser, Name }` | Alarm alert targeted at a specific user |
| `{userId}DeviceNotificationCount` | Alarm/notification object with `IsRead: false` | Increment unread notification counter |
| `{DeviceId}canbusdata` | CAN-bus data object | Real-time OBD/CAN-bus reading |
| `{DeviceId}drivingdata` | Driving behaviour object | Real-time driving event |
| `{DeviceId}JourneyRouteComplete` | `"Complete"` | Journey recording finished |
| `emit_from_server` | any | Echo response |
| `SimDetailResponse` | SIM data | SIM information response |

---

## 6. Database Interactions

### Sequelize Models

| Model | Table | Description |
|-------|-------|-------------|
| `tblgpsdata` | `tblgpsdata` | Primary GPS fix storage |
| `tblgpsdate` | `tblgpsdate` | Date-partitioned device activity |
| `tblhandshake` | `tblhandshake` | Device heartbeat log |
| `tblgpsdeletecash` | `tblgpsdeletecash` | Queued GPS-data deletion requests |
| `tblgpsdevice` | `tblgpsdevice` | Registered GPS hardware |
| `tblvehicle` | `tblvehicle` | Vehicle profiles and live state |
| `tblalarm` | `tblalarm` | Alarm event log |
| `tblapiaccessclient` | `tblapiaccessclient` | API access tokens and device allowlists |

### `tblgpsdata` — Column Reference

| Column | Type | Description |
|--------|------|-------------|
| `Id` | BIGINT (PK) | Composite: Unix timestamp + last-7 digits of DeviceId |
| `Datetime` | DATE | GPS timestamp (UTC+8) |
| `Date` | BIGINT | Unix epoch of GPS fix |
| `Latitude` | STRING | Decimal degrees (e.g., `"3.1234"`) |
| `Longitude` | STRING | Decimal degrees (e.g., `"101.5678"`) |
| `GPSPositioning` | CHAR(1) | `A` = valid fix, `V` = invalid/void |
| `Speed` | STRING | Speed in km/h |
| `Direction` | STRING | Heading 0–360° |
| `Status` | STRING | Raw input/output status hex string |
| `DeviceId` | STRING | 14-digit device identifier |
| `IsRelayToStopTheCar` | BOOLEAN | Relay-stop-car status flag |
| `IsSirenSound` | BOOLEAN | Siren active flag |
| `IsUserDefined` | BOOLEAN | User-defined output flag |
| `IsLockTheDoor` | BOOLEAN | Door lock flag |
| `IsUnlockTheDoor` | BOOLEAN | Door unlock flag |
| `IsSOS` | BOOLEAN | SOS/panic button flag |
| `IsWiringForAntiTamper` | BOOLEAN | Anti-tamper wiring / power-cut flag |
| `IsDoor` | BOOLEAN | Door open/closed flag |
| `IsEngine` | BOOLEAN | Ignition / engine-on status |
| `IsOriginalSirenTriggeringStatus` | BOOLEAN | Original siren trigger state |
| `IsPatchEngine` | BOOLEAN | Derived/patched engine status (default 0) |
| `IsOverSpeed` | BOOLEAN | Whether speed exceeded configured max (default 0) |
| `HDOP` | INTEGER | Horizontal Dilution of Precision |
| `Altitude` | INTEGER | Altitude in metres |
| `AD1` | STRING | Analogue input 1 / GPS source flag |
| `AD2` | STRING | Analogue input 2 |
| `OdoMeter` | INTEGER | Odometer reading (metres) |
| `CreatedDate` | DATE | Server-side insertion timestamp |

### `tblhandshake` — Column Reference

| Column | Type | Description |
|--------|------|-------------|
| `Id` | INTEGER (PK, AI) | Auto-increment |
| `DeviceId` | STRING | Device identifier |
| `Datetime` | DATE | Server time of heartbeat receipt |

### `tblgpsdate` — Column Reference

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK, AI) | Auto-increment |
| `DeviceId` | STRING | Device identifier |
| `GPSDate` | DATE | Date portion of GPS fix (for partitioned queries) |

### `tblgpsdeletecash` — Column Reference

| Column | Type | Description |
|--------|------|-------------|
| `Id` | INTEGER (PK, AI) | Auto-increment |
| `idVehicle` | INTEGER | Foreign key to `tblvehicle` |
| `DeviceId` | STRING | Device identifier |
| `idUser` | INTEGER | Requesting user ID |
| `Status` | STRING | `"Pending"` / `"Complete"` |
| `CreatedDate` | DATE | Request timestamp |
| `CreatedBy` | STRING | Username who submitted the request |
| `ModifiedDate` | DATE | Last status change |
| `RequestType` | STRING | Type of deletion request |

### Key Raw SQL Patterns

```sql
-- GPS data insert (all protocols)
INSERT INTO tblgpsdata
  (Id, Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction,
   Status, DeviceId, IsRelayToStopTheCar, IsSirenSound, IsUserDefined,
   IsLockTheDoor, IsUnlockTheDoor, IsSOS, IsWiringForAntiTamper, IsDoor,
   IsEngine, IsOriginalSirenTriggeringStatus, CreatedDate, HDOP, Altitude,
   AD1, AD2, OdoMeter, Date, IsPatchEngine, IsOverSpeed)
VALUES (...);

-- Heartbeat update
UPDATE tblvehicle
SET HandshakDatetime=?, IsOnline=true
WHERE deviceid=?;

-- Concox heartbeat update (with battery/ACC)
UPDATE tblvehicle
SET HandshakDatetime=?, IsOnline=true, IsACC=?, IsPowercutoff=?, BatteryPercentage=?
WHERE deviceid=?;

-- Alarm insert (ignition / fence / SOS)
INSERT INTO tblalarm
  (Datetime, Date, Latitude, Longitude, GPSPositioning, Speed, Direction,
   Status, DeviceId, AlarmCode, CreatedDate)
VALUES (...);

-- Historical report query (GetAllGpsDataNew)
SELECT SQL_CALC_FOUND_ROWS tgps.IsWiringForAntiTamper, tgps.DeviceId, tgps.Date,
  tgps.Latitude, tgps.Longitude, tgps.Speed, tgps.Direction, tgps.GPSPositioning,
  tgps.Status, tgps.IsRelayToStopTheCar, tgps.IsSirenSound, tgps.IsDoor,
  tgps.IsEngine, tgps.IsLockTheDoor, tgps.IsUnlockTheDoor, tgps.IsSOS,
  tgps.AD1, tgps.AD2, tgps.Altitude, tgps.OdoMeter
FROM tblgpsdata2 AS tgps
INNER JOIN tblgpsdevice AS tgd ON tgd.DeviceId = tgps.DeviceId
WHERE tgps.DeviceId = ? AND tgps.Date >= ? AND tgps.Date <= ?
ORDER BY ? LIMIT ? OFFSET ?;
SELECT FOUND_ROWS() AS TotalRecord;

-- Speed setting persistence
UPDATE tblvehicle SET MaxSpeed=? WHERE deviceid=?;

-- Relay setting persistence
UPDATE tblvehicle SET Relay=? WHERE deviceid=?;

-- Device online flag
UPDATE tblvehicle SET IsOnline=? WHERE deviceid=?;
```

### Redis Interactions Summary

```javascript
// Write latest GPS fix
client.set(DeviceId, JSON.stringify(objConnection));

// Write device socket connection info
client.set(DeviceId + 'SocketConnection', JSON.stringify({ IP, Port }));

// Write online status
client.set(DeviceId + 'Online', 'true');

// Read latest fix for REST API
client.get(DeviceId, callback);

// Read max speed for over-speed check
client.get(DeviceId + 'MaxSpeed', callback);

// Read/write ignition state
client.get(DeviceId + 'EngineStatus1', callback);
client.set(DeviceId + 'EngineStatus1', JSON.stringify({ IsEngine, Date }));

// Concox heartbeat state
client.set(DeviceId + 'ACC', IsACC.toString());
client.set(DeviceId + 'PowerCutOff', IsPowerCut.toString());
client.set(DeviceId + 'BatteryPercentage', VoltageLevel.toString());
```

---

## 7. Edge Cases & Error Handling

### Malformed / Invalid Packets

| Scenario | Handling |
|----------|----------|
| Exception during packet parsing | Caught with `try/catch`; error logged as `"Error Heartbeat Data = {line}"` or `"Error GPS Data = {line}"`. No crash. |
| JSON parse failure on Redis value | Wrapped in `try/catch`; falls back to default (null / empty object). |
| Concox timestamp deviates >1 hour from server | Historically guarded by a `timediffernce <= 3600` check (currently commented out but visible in code). |
| Missing coordinate fields | `deg_to_lat_long` has a fallback: if `geolib.useDecimal` throws, it falls back to `parseFloat(degree) + parseFloat(minutes)/60` with sign correction. |
| Beidou `7E` frame with wrong XOR | Devices are responsible for CRC validation on their side; server computes and appends CRC to outgoing commands but does not currently reject malformed inbound data. |

### Device Connectivity

| Scenario | Handling |
|----------|----------|
| Device disconnects before command ACK | `socketclient.setTimeout(10000)` fires; `socketclient.destroy()` is called; callback returns `{ success: false, message: "Device not connected. Try after 5 minute." }` |
| Device not found in Redis `{DeviceId}SocketConnection` | Falls back to global `SocketIPAddress` and `SocketPort` env-var values. |
| MySQL connection drops | All critical handlers call `mysql.createConnection(...)` to reconnect before executing queries when `connection.state == 'disconnected'`. |
| Redis error on read | Callback `err` parameter is checked; on error, stale / default values are used rather than crashing. |

### GPS Data Integrity

| Scenario | Handling |
|----------|----------|
| `Position = "V"` (no GPS fix) | Data is still inserted to DB but `IS NOT` cached to Redis or broadcast as `BikeRoute`. |
| `ProjectIgnitionStatus = "false"` for a device | `Command9955` exits early — no DB write, no Redis update, no Socket.io event. |
| OdoMeter returned as null/undefined | `lastGPSdata` controller defaults to `0`: `objfinaldata.OdoMeter = 0`. Display value is `Math.floor(parseInt(OdoMeter) / 1000)` (converts metres to km). |
| Speed = 0 with engine on | Vehicle status set to `2` (idle/stationary) rather than `1` (moving). |

### Authentication & Authorisation

| Scenario | Handling |
|----------|----------|
| Invalid Token+Key in `/lastGPSdata` | Returns `{ success: false, message: "Invalid Token/Key.", data: null }` |
| `DeviceId` not in allowed list for API client | Returns `{ success: false, message: "Invalid DeviceId.", data: null }` |
| `AccessClient.DeviceId` is null | Same "Invalid DeviceId" response. |

### Alarm & Notification Failures

| Scenario | Handling |
|----------|----------|
| Firebase token invalid (`registration-token-not-registered`) | Caught in `.catch()` on `admin.messaging().send()`; error logged with token; notification silently dropped. |
| Firebase `invalid-argument` error | Same catch block; error + token logged. |
| No subscribers for alarm | `SendPushNotification` checks `lstNotification.length > 0` before sending; no-op if empty. |
| Geo-fence evaluation exception | `geolib` calls are inside the standard async chain; uncaught exceptions propagate to the outer `try/catch`. |

### Data Deletion

| Scenario | Handling |
|----------|----------|
| Deletion job queued | A row is inserted into `tblgpsdeletecash` with `Status = "Pending"`. A background worker processes it asynchronously. |
| `/gpsdata/DeleteGPSDeleteById` | Removes the queued record; does not immediately delete GPS data. |

### Concox-Specific Edge Cases

| Scenario | Handling |
|----------|----------|
| `Online` key absent in Redis (first heartbeat) | `GetOldOnline = false` → always triggers a DB `UPDATE` and Redis `SET`. Subsequent beats only update if status changes. |
| Power-cut-off flag set | `IsWiringForAntiTamper = true` is written to both the GPS record and Redis `{DeviceId}PowerCutOff`. |
| Relay ACK contains wrong response prefix | Expected `line[2:6] == "0500"` for Beidou relay, `line[0:4] == "2424"` for MyPin commands; any other value triggers failure callback. |
