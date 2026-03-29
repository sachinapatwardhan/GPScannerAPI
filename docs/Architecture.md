# Architecture & Technology Stack

## System Architecture

GPScannerAPI uses a **monolithic Node.js** application serving both REST API and WebSocket connections from a single `server.js` entry point.

```
┌─────────────────────────────────────────────────────────┐
│                      Clients                            │
│   Web Browser  │  Mobile App  │  GPS Devices  │  3rd Party │
└────────┬───────┴──────┬───────┴───────┬───────┴────────┘
         │ HTTP/HTTPS   │ HTTP          │ Socket.io
         ▼              ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                   server.js (Express)                   │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   REST API Routes   │  │  WebSocket (Socket.io)   │  │
│  │   /api/v2/*         │  │  Port 7020               │  │
│  └─────────┬───────────┘  └──────────┬───────────────┘  │
│            │                         │                   │
│  ┌─────────▼─────────────────────────▼───────────────┐  │
│  │              Controllers / Handlers                │  │
│  │   85 REST controllers + 3 Socket API handlers      │  │
│  └─────────────────────┬───────────────────────────── ┘  │
└────────────────────────┼────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌─────────────┐ ┌─────────────┐ ┌────────────┐
  │    MySQL    │ │    Redis    │ │  Firebase  │
  │  (Sequelize)│ │   Cache     │ │  (Push)    │
  └─────────────┘ └─────────────┘ └────────────┘
```

---

## Technology Stack

### Core

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | ≥ 8.x |
| Web Framework | Express.js | ~4.13.4 |
| Real-time | Socket.io | 2.0.4 |
| ORM | Sequelize | ~3.22.0 |
| Database | MySQL | ≥ 5.7 |
| Cache | Redis | ≥ 3.x |

### Authentication & Security

| Library | Purpose |
|---------|---------|
| `jwt-simple` (v0.5.0) | JWT token signing/verification |
| `passport` | Authentication middleware |
| `bcrypt` / `crypto` | Password hashing |

### Communication

| Library | Purpose |
|---------|---------|
| `nodemailer` | Email delivery |
| `node-apn` | Apple Push Notifications (APN) |
| `firebase-admin` | Firebase Cloud Messaging (Android) |
| `nexmo` / `vonage` | SMS via Nexmo API |

### Data Processing

| Library | Purpose |
|---------|---------|
| `moment` / `moment-timezone` | Date/time handling and timezones |
| `geolib` | Geospatial distance/bearing calculations |
| `node-geocoder` | Address geocoding (Nominatim provider) |
| `xlsx` / `excel4node` | Excel export/import |
| `html-pdf` | PDF report generation |
| `formidable` | Multipart file uploads |

### Scheduling & Monitoring

| Library | Purpose |
|---------|---------|
| `node-schedule` | Cron-like job scheduling |
| `swagger-stats` | API usage statistics middleware |

---

## Directory Structure

```
GPScannerAPI/
├── server.js              # Main application entry point (~23,800 lines)
├── package.json           # NPM dependencies
├── .env                   # Environment variables (dev)
├── _Live.env              # Environment variables (production)
│
├── controllers/           # 85 REST API controllers
├── models1/               # 82 Sequelize model definitions
├── routes/
│   └── v2.js              # Versioned route definitions
├── functions/
│   ├── common.js          # Shared utility functions
│   └── shop.js            # E-commerce service functions
├── connection/
│   ├── DatabaseConnection.js  # Promise-based MySQL connection
│   └── pool.js                # MySQL connection pool
├── config/
│   ├── config.json        # Sequelize DB configuration
│   └── webcash.json       # WebCash payment gateway config
├── migrations/            # 36 Sequelize migration files
├── certs/                 # SSL certificates (APN push)
├── MediaUploads/          # User-uploaded media files
└── RenewControllers/      # Device renewal controllers
```

---

## External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Firebase** | Android push notifications | `firebase-admin` SDK |
| **Apple APN** | iOS push notifications | `node-apn` + certificates |
| **Nexmo / Vonage** | SMS OTP and alerts | REST API |
| **CVPay / WebCash** | Payment processing | REST callback integration |
| **Nominatim** | Reverse geocoding | `node-geocoder` |
| **MySQL** | Primary data store | Sequelize ORM |
| **Redis** | Session/data caching | `redis` npm client |

---

## Middleware Stack

The following middleware is applied globally in `server.js`:

1. **Passport.js** — `app.use(passport.initialize())`
2. **CORS** — Allows all origins; methods: GET, POST, OPTIONS, PUT, PATCH, DELETE
3. **Static Files** — `express.static(__dirname + '/')`
4. **Swagger Stats** — API usage monitoring at `/_swagger-stats/`
5. **Body Parser** — JSON body parsing for all POST endpoints

---

## GPS Device Types Supported

| Device Type | Socket Handler | Protocol |
|------------|----------------|---------|
| MyPin / Maark | `socketapi.js` | `Command9955` |
| Concox | `socketapi_concox.js` | `CommandConcoxGPS` / `CommandConcoxAlarm` |
| Beidou | `socketapi_beidou.js` | Custom |
| Philippines | `socketapi.js` | `GPSDATA` |

---

## Data Flow: GPS Update

```
GPS Device
    │  (Socket.io event: Command9955 / GPSDATA)
    ▼
socketapi.js handler
    │  Parse packet → validate IMEI
    ▼
Insert into tblgpsdata (MySQL)
    │
    ├──► Update tblvehicle (last position)
    ├──► Check geofences (tblfence / tbladvancefence)
    ├──► Evaluate alarms (tblalarm)
    └──► Broadcast to subscribed web clients via Socket.io room
```
