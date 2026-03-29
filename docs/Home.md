# GPScannerAPI — Project Wiki

Welcome to the **GPScannerAPI** (Maark) documentation. This wiki covers the full API reference, architecture, database schema, and integration guides for the GPS Tracking & Fleet Management platform.

---

## Table of Contents

| Page | Description |
|------|-------------|
| [Architecture & Tech Stack](Architecture) | System overview, frameworks, external services |
| [Authentication](Authentication) | JWT auth, login endpoints, token usage |
| [Vehicle & Device Management](Vehicle-Device-Management) | Vehicle CRUD, GPS device registry, assignment |
| [GPS Tracking & Real-time](GPS-Tracking) | Live tracking, WebSocket events, geofencing |
| [Reporting](Reporting) | Trip reports, export, alarms, journey |
| [Billing & Payments](Billing-Payments) | Renewal, orders, payment gateway |
| [User Management](User-Management) | Roles, permissions, distributors, retailers |
| [Notifications & Alerts](Notifications) | Push notifications, alarms, SOS |
| [Settings & Configuration](Settings-Configuration) | App settings, localization, email |
| [Database Models](Database-Models) | All 82 Sequelize model definitions |

---

## Project Overview

**GPScannerAPI** is a Node.js + Express RESTful API and WebSocket server for GPS device tracking and fleet management. It is commercially deployed under the brand **Maark**.

### Key Features

- 📍 **Real-time GPS tracking** via WebSocket (Socket.io) for multiple device types (MyPin, Concox, Beidou, Philippines)
- 🚗 **Fleet management** — vehicles, groups, fuel calibration, driver behavior (CAN-BUS)
- 🗺️ **Geofencing** — standard and advanced fence zones with in/out alerts
- 🛤️ **Journey & route planning** — create routes, track journeys, export reports
- 💳 **Billing & renewals** — device renewal pricing, order service, CVPay/WebCash payment integration
- 📲 **Push notifications** — Firebase (Android/iOS) and APN support
- 👥 **Multi-tier user management** — Admin → Distributor → Retailer → Sales Agent → Customer
- 🌏 **Multi-country / multi-language** — country, state, city, currency, and language management
- 📊 **Reports & exports** — PDF and Excel reports for trips, alarms, speed, engine idle, and parking
- 🔗 **API access control** — third-party client access management

---

## Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 8.x |
| MySQL | ≥ 5.7 |
| Redis | ≥ 3.x |

### Installation

```bash
git clone https://github.com/sachinapatwardhan/GPScannerAPI.git
cd GPScannerAPI
npm install
cp .env.example .env   # fill in your environment values
node server.js
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MysqlHost` | MySQL server host | `10.10.1.12` |
| `MysqlPort` | MySQL port | `3306` |
| `Mysqluser` | MySQL username | `maarkdbuser` |
| `Mysqlpassword` | MySQL password | |
| `Mysqldatabase` | Database name | `maarkdb` |
| `APIPort` | REST API listen port | `7212` |
| `SocketPort` | WebSocket listen port | `7020` |
| `SocketIPAddress` | WebSocket bind address | `127.0.0.1` |
| `TokenKey` | JWT signing secret | |
| `IsProduction` | Production flag | `true` |
| `RedisHost` | Redis server host | `10.10.0.20` |
| `RedisPort` | Redis port | `6379` |
| `RedisPassword` | Redis password | |
| `SMTPService` | Email service name | `mail.maark.my` |
| `SMTPhost` | SMTP host | `mail.maark.my` |
| `SMTPport` | SMTP port | `465` |
| `SMTPuser` | SMTP username | |
| `SMTPpass` | SMTP password | |
| `SMSAPIkey` | Nexmo/Vonage SMS API key | |
| `SMSapisecret` | Nexmo/Vonage SMS API secret | |
| `GeocodingService` | Geocoding provider | `nominatim` |
| `CVPayMerchantId` | CVPay merchant ID | |
| `CVPayPaymentURL` | CVPay payment URL | |
| `MaarkNotifyUrl` | Internal notification URL | `http://127.0.0.1:7212` |

### Running Database Migrations

```bash
sequelize db:migrate
```

---

## API Base URL

```
http://<host>:<APIPort>/api/v2/
```

All REST endpoints are versioned under `/api/v2/`. Authentication uses JWT Bearer tokens (see [Authentication](Authentication)).
