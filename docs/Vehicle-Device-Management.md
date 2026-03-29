# Vehicle & Device Management

## Overview

This module manages the full lifecycle of vehicles, GPS devices, SIM cards, and their assignment to users.

---

## Vehicle Endpoints (`/api/v2/vehicles/`, `/api/v2/bike/`)

### Vehicle CRUD

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vehicles/GetAllDynamicVehicle` | GET | List all vehicles (dynamic/paginated) |
| `/vehicles/GetAllVehicleByUser` | GET | Get vehicles for authenticated user |
| `/vehicles/GetVehicleById` | GET | Get single vehicle by ID |
| `/vehicles/SaveVehicle` | POST | Create or update a vehicle |
| `/vehicles/DeleteVehicle` | POST | Soft-delete a vehicle |
| `/vehicles/ExportVehicle` | GET | Export vehicles to Excel |
| `/vehicles/GetVehicleCurrentLocation` | GET | Get last known GPS position |

### Bike/Motorcycle Specific

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bike/getAllBikeByUser` | GET | Get all bikes for user |
| `/bike/GetVehicleById` | GET | Get bike by ID |
| `/bike/GetAllWorkingBike` | GET | Get online/active bikes |
| `/bike/GetAllGPSByTimeZoneDate` | POST | GPS history filtered by timezone/date |
| `/bike/ChangeFenceByBike` | POST | Assign geofence to bike |
| `/bike/SaveVehicle` | POST | Create or update bike |
| `/bike/GetVehicleCurrentLocation` | GET | Current position |

### Vehicle Transfer & Assignment

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vehicles/TransferDevicetoUser` | POST | Transfer a GPS device to another user |
| `/admin/assignDevice` | POST | Admin assigns device to user |
| `/admin/assignDeviceByExcel` | POST | Bulk device assignment via Excel upload |
| `/admin/downloadAssignDeviceExcelTemplate` | GET | Download Excel template |

---

## GPS Device Registry (`/api/v2/PetDevice/`, `/api/v2/admin/`)

> **Note:** "PetDevice" is a general GPS device controller, not limited to pet trackers.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/PetDevice/GetAllGPSDevice` | GET | List all registered GPS devices |
| `/PetDevice/GetGPSDeviceById` | GET | Get device by ID |
| `/PetDevice/GetGPSDeviceByIMEI` | GET | Look up device by IMEI number |
| `/PetDevice/SaveGPSDevice` | POST | Register or update a GPS device |
| `/PetDevice/DeleteDeviceById` | POST | Remove a GPS device |
| `/PetDevice/uploadExcelDevice` | POST | Bulk import devices via Excel |
| `/PetDevice/DownloadTemplate` | GET | Download device import template |
| `/admin/getAllGpsDevices` | GET | Admin: list all devices |
| `/admin/getAutocompleteSalesAgent` | GET | Autocomplete for sales agent assignment |

---

## Vehicle Groups (`/api/v2/vehiclegroup/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vehiclegroup/GetAllVehicleGroup` | GET | List all vehicle groups |
| `/vehiclegroup/SaveVehicleGroup` | POST | Create or update a group |
| `/vehiclegroup/DeleteVehicleGroup` | POST | Delete a group |

---

## Vehicle Types (`/api/v2/vehicletype/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vehicletype/GetAllVehicleType` | GET | List all vehicle types |
| `/vehicletype/SaveVehicleType` | POST | Create or update a vehicle type |
| `/vehicletype/DeleteVehicleType` | POST | Delete a vehicle type |

---

## SIM Card Management (`/api/v2/sim/`)

37 endpoints covering the full SIM lifecycle:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sim/GetAllSim` | GET | List all SIM cards |
| `/sim/GetSimById` | GET | Get SIM by ID |
| `/sim/SaveSim` | POST | Register or update SIM |
| `/sim/DeleteSim` | POST | Remove SIM record |
| `/sim/GetAllSimByDevice` | GET | Get SIMs assigned to a device |
| `/simreplace/GetAllSimReplace` | GET | SIM replacement history |
| `/simreplace/SaveSimReplace` | POST | Record a SIM replacement |
| `/telco/GetAllTelco` | GET | List telecom providers |
| `/telco/SaveTelco` | POST | Add or update a telco |

---

## Vehicle Data Model

### `tblvehicle`

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `iduser` | INT | Owner user ID |
| `Name` | VARCHAR | Vehicle name/label |
| `deviceid` | VARCHAR | Associated GPS device IMEI |
| `renewaldate` | DATE | Device renewal due date |
| `IsOnline` | TINYINT | Current online status |
| `MaxSpeed` | INT | Speed limit for alerts |
| `BatteryPercentage` | INT | Last known battery % |
| `GPRSInterval` | INT | Data send interval (seconds) |
| `TimeZone` | VARCHAR | Vehicle's timezone |
| `DeviceType` | VARCHAR | Type of GPS device |
| `FuelType` | VARCHAR | Fuel type (Petrol/Diesel/Electric) |
| `Average` | DECIMAL | Fuel average (km/L) |
| `DriverName` | VARCHAR | Assigned driver name |
| `InsurenceDate` | DATE | Insurance expiry date |
| `PUCDate` | DATE | Pollution certificate expiry |
| `RCNo` | VARCHAR | Registration certificate number |
| `LicenceNo` | VARCHAR | Driver licence number |
| `FuelCapacity` | DECIMAL | Tank capacity in litres |
| `IsFule` | TINYINT | Fuel monitoring enabled |

### `tblgpsdevice`

| Field | Type | Description |
|-------|------|-------------|
| `DeviceId` | INT | Primary key |
| `IMEI` | VARCHAR | Device IMEI number (unique) |
| `Type` | VARCHAR | Device model/type |
| `Version` | VARCHAR | Firmware version |
| `CountryId` | INT | Country assignment |
| `TelCoId` | INT | SIM telecom provider |
| `SimNum` | VARCHAR | SIM phone number |
| `IsActive` | TINYINT | Active status |
| `ExpiryDate` | DATE | Subscription expiry |
| `Company` | VARCHAR | Owning company |
| `Status` | VARCHAR | Current status |

---

## Fuel Calibration (`/api/v2/fuelcalibration/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/fuelcalibration/SetfullfuelPoint` | POST | Set full-tank calibration point |
| `/fuelcalibration/SetVehicleFuelData` | POST | Record fuel level data |

---

## Driver Behavior & CAN-BUS (`/api/v2/canbusdata/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/canbusdata/GetAllCanbusData` | GET | List CAN-BUS data records |
| `/canbusdata/ExportAllCanbusData` | GET | Export CAN-BUS data to Excel |
| `/canbusdata/GetAllDrivingBehavior` | GET | Driving behavior summary |

CAN-BUS data includes engine diagnostics, RPM, throttle, and other OBD2 parameters transmitted by compatible devices using the `Command9901` and `Command9902` socket events.

---

## Sales Agent Device Access (`/api/v2/SalesAgentDevice/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/SalesAgentDevice/GetAllRenewDataForSalesAgent` | GET | Renewals visible to sales agent |
| `/SalesAgentDevice/UpdateDeviceBySalesAgent` | POST | Sales agent updates device info |
