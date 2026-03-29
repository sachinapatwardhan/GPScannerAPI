# GPS Tracking & Real-time

## Overview

Real-time GPS tracking is handled via **Socket.io** on a dedicated port (`SocketPort`, default `7020`). GPS devices connect via WebSocket and emit location packets that are stored in MySQL and broadcast to subscribed client sessions.

---

## WebSocket Connection

```javascript
const socket = io('http://<host>:<SocketPort>');

socket.on('connect', () => {
  console.log('Connected');
});
```

---

## GPS Data Flow

```
GPS Device
    │ (Socket event: Command9955 / GPSDATA / CommandConcoxGPS)
    ▼
Server receives and parses packet
    │
    ├── Validates IMEI against tblgpsdevice
    ├── Inserts row into tblgpsdata
    ├── Updates tblvehicle (IsOnline, last position)
    ├── Checks all active geofences for in/out triggers
    ├── Evaluates alarm conditions (speed, SOS, power cut, etc.)
    └── Broadcasts updated position to web client room
```

---

## Socket Events (Device → Server)

### `Command9955` — MyPin / Maark Device

Primary event for Maark-branded GPS trackers.

**Payload fields:**

| Field | Description |
|-------|-------------|
| `Datetime` | UTC timestamp |
| `Latitude` | GPS latitude |
| `Longitude` | GPS longitude |
| `Speed` | Speed in km/h |
| `Direction` | Heading in degrees |
| `Status` | Device status bitmask |
| `DeviceId` | Device IMEI |
| `HDOP` | Horizontal dilution of precision |
| `Altitude` | Altitude in metres |
| `AD1`, `AD2` | Analog sensor readings |
| `IsEngine` | Engine on/off flag |
| `IsSOS` | SOS button pressed |
| `IsRelayToStopTheCar` | Remote cut relay status |
| `IsSirenSound` | Siren activated |
| `IsLockTheDoor` | Door lock status |
| `IsDoor` | Door open/closed |

---

### `GPSDATA` — Philippines / Regional Device

Alternative GPS packet format used for Philippines deployment.

---

### `CommandConcoxGPS` — Concox Device

Handled by `socketapi_concox.js`.

---

### `Command9901` — CAN-BUS Data

Receives vehicle diagnostic data (OBD2) from devices supporting CAN-BUS.

---

### `Command9902` — Driving Behavior

Receives driving behavior metrics: harsh braking, acceleration, cornering.

---

## Socket Events (Server → Client)

| Event | Description |
|-------|-------------|
| `DeviceAlarm` | Alarm triggered on a tracked vehicle |
| `JourneyRouteComplete` | A journey has been completed |
| `CommandDeviceStatus` | Device status change broadcast |
| `UpdateDeviceStatusNewSocket` | Alternative device status update |

---

## REST API: Live Tracking

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vehicles/GetVehicleCurrentLocation` | GET | Last known position for a vehicle |
| `/bike/GetVehicleCurrentLocation` | GET | Last known position for a bike |
| `/homepage/getAllVehicleByUser` | GET | All vehicles with current positions |
| `/homepage/GetVehicleCurrentLocation` | GET | Current location for all user vehicles |
| `/MapData/GetAllBike` | GET | All devices for map display |
| `/MapData/GetPath` | POST | Historical GPS path for a time range |

---

## Geofencing

### Standard Fences (`/api/v2/MapData/`, `/api/v2/advancefence/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/MapData/GetFenceByPet` | GET | Get fence for a device |
| `/MapData/SaveFence` | POST | Create or update a fence |
| `/MapData/DeleteFence` | POST | Remove a fence |
| `/advancefence/GetAllAdvancefence` | GET | List advanced fences |
| `/advancefence/SaveFenceByIdNew` | POST | Create advanced fence |
| `/advancefence/updateAdvanceFence` | POST | Update advanced fence |
| `/advancefence/GetFenceById` | GET | Get advanced fence by ID |
| `/advancefence/DeleteFenceById` | POST | Delete advanced fence |

### Fence Types

| Type | Description |
|------|-------------|
| **Circle** | Defined by center point and radius |
| **Polygon** | Custom polygon shape (advanced fence) |

### Fence Alerts

When a vehicle enters or exits a geofence:
- An entry is created in `tblalarm`
- A push notification is sent to the device owner
- A socket event is emitted to the web client

---

## GPS Data Model

### `tblgpsdata`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | BIGINT | Primary key |
| `Datetime` | DATETIME | GPS timestamp |
| `Latitude` | DECIMAL(10,7) | GPS latitude |
| `Longitude` | DECIMAL(10,7) | GPS longitude |
| `Speed` | DECIMAL | Speed in km/h |
| `Direction` | INT | Heading (0–360 degrees) |
| `Status` | VARCHAR | Status bitmask string |
| `DeviceId` | VARCHAR | IMEI of reporting device |
| `HDOP` | DECIMAL | Horizontal accuracy |
| `Altitude` | DECIMAL | Height in metres |
| `AD1` | DECIMAL | Analog input 1 |
| `AD2` | DECIMAL | Analog input 2 |
| `IsEngine` | TINYINT | Engine status |
| `IsSOS` | TINYINT | SOS flag |
| `IsRelayToStopTheCar` | TINYINT | Cut relay flag |
| `IsSirenSound` | TINYINT | Siren flag |
| `IsLockTheDoor` | TINYINT | Lock flag |
| `IsUnlockTheDoor` | TINYINT | Unlock flag |
| `IsDoor` | TINYINT | Door open flag |
| `IsWiringForAntiTamper` | TINYINT | Anti-tamper wire flag |
| `IsUserDefined` | TINYINT | Custom event flag |

---

## Favorite Places (`/api/v2/favoriteplace/`)

Users can save named locations (e.g., home, office) linked to their devices.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/favoriteplace/GetAllFavoritePlaceByDevice` | GET | List saved places for device |
| `/favoriteplace/SaveFavoritePlace` | POST | Create a named place |
| `/favoriteplace/DeleteFavoritePlace` | POST | Remove a saved place |

---

## Journey & Route Planning (`/api/v2/journey/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/journey/getAllCompletedJourney` | GET | List completed journeys |
| `/journey/GetDeviceJourney` | GET | Journey data for a device |
| `/journey/StartJourney` | POST | Start a new journey |
| `/journey/deleteJourneyById` | POST | Delete a journey |
| `/journey/ExportReport` | GET | Export journey report |

Journey routes are stored in `tbljourneyroute` and `tbljourneygpsdata`.
