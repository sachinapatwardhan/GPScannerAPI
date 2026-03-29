# Reporting

## Overview

The reporting module provides historical GPS data queries, trip analysis, alarm reports, and Excel/PDF export capabilities. Multiple report controllers exist for different regional deployments.

---

## Report Controllers

| Controller | Route Prefix | Purpose |
|------------|-------------|---------|
| `Report.js` | `/api/v2/Report/` | Primary report controller |
| `Report_MyPinHere.js` | `/api/v2/ReportMyPin/` | MyPinHere deployment variant |
| `philireport.js` | `/api/v2/philireport/` | Philippines deployment |
| `trackerReport.js` | `/api/v2/trackerReport/` | Tracker report processing |

---

## GPS History

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/Report/GetAllGPSByTimeZoneDate` | POST | GPS track points for a date range |
| `/bike/GetAllGPSByTimeZoneDate` | POST | Bike GPS history |

### Request Parameters

```json
{
  "DeviceId": "359123456789012",
  "FromDate": "2024-01-01",
  "ToDate": "2024-01-31",
  "TimeZone": "Asia/Kuala_Lumpur"
}
```

---

## Trip Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/Report/ExportDetailTripReport` | GET | Export detailed trip report (Excel) |
| `/Report/PrintDetailTripReport` | GET | Print-ready trip report (PDF) |
| `/Report/GetAllDailyStatDate` | POST | Daily statistics by date |

---

## Alarm & Alert Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gpsdata/GetAllAlarm` | GET | List all device alarms |
| `/Report/GetAllFenceInAndOutData` | POST | Geofence entry/exit log |
| `/Report/GetAllEngineData` | POST | Engine on/off events |
| `/Report/GetAllParkingData` | POST | Parking/stop events |

---

## Speed Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gpsdata/GetAllSpeedDataReport` | GET | Speed events for a device |
| `/Report/GetAllWoringHourForReport` | POST | Working hours summary |

---

## Idle Time Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gpsdata/GetAllEngineidleReport` | GET | Engine idle time report |

---

## GPS Data Export

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gpsdata/ExportAllGpsData` | GET | Export all GPS data to Excel |
| `/gpsdata/GetAllGpsData` | GET | Paginated GPS data list |

---

## Journey Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/journey/ExportReport` | GET | Export journey summary to Excel |
| `/journey/getAllCompletedJourney` | GET | List completed journeys with stats |

---

## Tracker Reports (`/api/v2/trackerReport/`)

Background processor for generating summary reports stored in `tbltrackerreport`.

| Field | Description |
|-------|-------------|
| `ProcessingStatus` | `pending`, `processing`, `done`, `failed` |
| `ReverseGeocode` | Reverse geocoded address for each stop |

---

## Philippines Reports (`/api/v2/philireport/`)

24 endpoints mirroring the main report module with Philippines-specific formatting and timezone handling.

---

## Report Filters

All reports accept the following common filters:

| Parameter | Description |
|-----------|-------------|
| `DeviceId` | GPS device IMEI |
| `FromDate` | Start date (YYYY-MM-DD) |
| `ToDate` | End date (YYYY-MM-DD) |
| `TimeZone` | IANA timezone string |
| `UserId` | Filter by user |

---

## Export Formats

| Format | Library | Trigger |
|--------|---------|---------|
| **Excel (.xlsx)** | `xlsx` / `excel4node` | `Export*` endpoints |
| **PDF** | `html-pdf` | `Print*` endpoints |

---

## Dashboard Data (`/api/v2/dashboard/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard/GetAllWorkingBike` | GET | Count of online/offline vehicles |
| `/dashboard/GetDashboardData` | GET | Summary stats (vehicles, alarms, etc.) |
| `/dashboard/SalesDashBoardData` | GET | Sales performance metrics |

### Dashboard Summary Fields

| Field | Description |
|-------|-------------|
| `TotalVehicles` | Total registered vehicles |
| `OnlineVehicles` | Currently online |
| `OfflineVehicles` | Currently offline |
| `ExpiringDevices` | Devices expiring within 30 days |
| `TotalAlarms` | Alarms triggered today |
| `ActiveJourneys` | Journeys in progress |
