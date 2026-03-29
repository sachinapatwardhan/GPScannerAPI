# Database Models

## Overview

GPScannerAPI uses **Sequelize ORM** (v3.22.0) with MySQL. All models are defined in `/models1/`. The database is named `maarkdb`.

**Global Sequelize config:**
- `timestamps: false` — no auto `createdAt`/`updatedAt` unless explicitly added
- `multipleStatements: true` — allows multi-query MySQL calls
- Connection pool: max 5, min 0, idle 10000ms

---

## User & Authentication Models

### `tbluserinformation`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `email` | VARCHAR | Login email |
| `username` | VARCHAR | Display name |
| `password` | VARCHAR | Hashed password |
| `phone` | VARCHAR | Mobile number |
| `country` | INT | Country ID (FK) |
| `gender` | VARCHAR | Gender |
| `OTP` | VARCHAR | One-time password |
| `AppVersion` | VARCHAR | Last app version used |
| `Platform` | VARCHAR | `Android` / `iOS` / `Web` |
| `SpeedValue` | VARCHAR | Speed unit preference |
| `IdleMinute` | INT | Engine idle threshold |
| `Amount` | DECIMAL | Account balance |

### `tbluserinrole`
Maps users to roles.
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `UserId` | INT (FK) | User reference |
| `RoleId` | INT (FK) | Role reference |

### `tblrole`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `RoleName` | VARCHAR | Role name |
| `Description` | VARCHAR | Role description |

### `tbluserpermission`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `PermissionName` | VARCHAR | Permission label |
| `RoleId` | INT (FK) | Assigned role |

### `tbldistributorsubuser`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `DistributorId` | INT (FK) | Parent distributor |
| `UserId` | INT (FK) | Sub-user |

---

## Vehicle & Device Models

### `tblvehicle`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `iduser` | INT (FK) | Owner user |
| `Name` | VARCHAR | Vehicle label |
| `deviceid` | VARCHAR | GPS device IMEI |
| `renewaldate` | DATE | Renewal due date |
| `IsOnline` | TINYINT | Online status |
| `MaxSpeed` | INT | Speed alert threshold |
| `BatteryPercentage` | INT | Last battery reading |
| `GPRSInterval` | INT | Update interval (seconds) |
| `TimeZone` | VARCHAR | IANA timezone |
| `DeviceType` | VARCHAR | Device model |
| `FuelType` | VARCHAR | Fuel type |
| `Average` | DECIMAL | Fuel average (km/L) |
| `DriverName` | VARCHAR | Driver name |
| `InsurenceDate` | DATE | Insurance expiry |
| `PUCDate` | DATE | PUC expiry |
| `RCNo` | VARCHAR | Registration number |
| `LicenceNo` | VARCHAR | Driver licence |
| `FuelCapacity` | DECIMAL | Tank size (litres) |
| `IsFule` | TINYINT | Fuel monitoring on |

### `tblgpsdevice`
| Field | Type | Description |
|-------|------|-------------|
| `DeviceId` | INT (PK) | Primary key |
| `IMEI` | VARCHAR | Device IMEI (unique) |
| `Type` | VARCHAR | Device model |
| `Version` | VARCHAR | Firmware version |
| `CountryId` | INT (FK) | Country |
| `TelCoId` | INT (FK) | Telecom provider |
| `SimNum` | VARCHAR | SIM phone number |
| `IsActive` | TINYINT | Active status |
| `ExpiryDate` | DATE | Subscription expiry |
| `Company` | VARCHAR | Company name |
| `Status` | VARCHAR | Device status |

### `tblvehiclegroup`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `GroupName` | VARCHAR | Group name |
| `UserId` | INT (FK) | Owner |

### `tblvehicletype`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `VehicleTypeName` | VARCHAR | Type name |
| `IconUrl` | VARCHAR | Icon image URL |
| `PowerCutIconUrl` | VARCHAR | Power cut icon |

---

## GPS Data Models

### `tblgpsdata`
| Field | Type | Description |
|-------|------|-------------|
| `Id` | BIGINT (PK) | Primary key |
| `Datetime` | DATETIME | GPS timestamp |
| `Latitude` | DECIMAL(10,7) | Latitude |
| `Longitude` | DECIMAL(10,7) | Longitude |
| `Speed` | DECIMAL | Speed (km/h) |
| `Direction` | INT | Heading (degrees) |
| `Status` | VARCHAR | Status bitmask |
| `DeviceId` | VARCHAR | IMEI |
| `HDOP` | DECIMAL | GPS accuracy |
| `Altitude` | DECIMAL | Altitude (m) |
| `AD1` | DECIMAL | Analog input 1 |
| `AD2` | DECIMAL | Analog input 2 |
| `IsEngine` | TINYINT | Engine status |
| `IsSOS` | TINYINT | SOS flag |
| `IsRelayToStopTheCar` | TINYINT | Relay flag |
| `IsSirenSound` | TINYINT | Siren flag |
| `IsLockTheDoor` | TINYINT | Door lock |
| `IsUnlockTheDoor` | TINYINT | Door unlock |
| `IsDoor` | TINYINT | Door sensor |
| `IsWiringForAntiTamper` | TINYINT | Anti-tamper |
| `IsUserDefined` | TINYINT | Custom event |

### `tblcanbusdata`
CAN-BUS vehicle diagnostics from OBD2-compatible devices.

### `tbldrivingdata`
Driver behavior metrics (harsh braking, acceleration, cornering).

---

## Geofencing Models

### `tblfence`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `DeviceId` | VARCHAR | Associated device |
| `FenceName` | VARCHAR | Fence label |
| `Latitude` | DECIMAL | Center latitude |
| `Longitude` | DECIMAL | Center longitude |
| `Radius` | INT | Circle radius (metres) |
| `IsActive` | TINYINT | Active flag |

### `tbladvancefence`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `FenceName` | VARCHAR | Name |
| `Coordinates` | TEXT | Polygon coordinate list (JSON) |
| `UserId` | INT (FK) | Owner |
| `IsActive` | TINYINT | Active flag |

---

## Journey & Route Models

### `tbljourneyroute`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `DeviceId` | VARCHAR | Device IMEI |
| `StartDatetime` | DATETIME | Journey start time |
| `EndDatetime` | DATETIME | Journey end time |
| `Distance` | DECIMAL | Total distance (km) |
| `IsComplete` | TINYINT | Completion flag |

### `tbljourneygpsdata`
GPS track points captured during a journey.

### `tblroute`
Pre-defined route definitions.

### `tblroutemark` / `tblroutemarker`
Waypoints and markers along routes.

---

## Billing & Licensing Models

### `tbllicencemanager`
| Field | Type | Description |
|-------|------|-------------|
| `Id` | INT (PK) | Primary key |
| `AppId` | INT (FK) | Application |
| `DeviceId` | INT (FK) | Device |
| `UserId` | INT (FK) | User |
| `LicenceType` | VARCHAR | Tier |
| `ExpiryDate` | DATE | Expiry |
| `IsActive` | TINYINT | Active |

### `tblorderservice`
| Field | Type | Description |
|-------|------|-------------|
| `Id` | INT (PK) | Primary key |
| `UserId` | INT (FK) | Customer |
| `TotalAmount` | DECIMAL | Order total |
| `Status` | VARCHAR | `pending` / `paid` / `cancelled` |
| `PaymentMethod` | VARCHAR | Payment channel |
| `TransactionRef` | VARCHAR | External reference |
| `CreatedAt` | DATETIME | Order timestamp |

### `tblrenewtransaction`
Records each successful renewal payment.

### `tbldevicerenewprice`
Pricing matrix for device renewals per app/licence type.

---

## Notification Models

### `tblpushnotification`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `UserId` | INT (FK) | Target user |
| `Title` | VARCHAR | Notification title |
| `Message` | TEXT | Notification body |
| `Type` | VARCHAR | Notification category |
| `IsRead` | TINYINT | Read status |
| `CreatedAt` | DATETIME | Send timestamp |

### `tblalarm`
Device-generated alarm events (speed, fence, SOS, etc.)

### `tblsos`
SOS emergency events — handled with priority.

### `tblnotificationsetting`
Per-user notification preferences for each alarm type.

### `tblpwa_notification_subscription`
Web Push (PWA) subscription tokens per device/browser.

---

## Communication Models

### `tblsimdetails`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `IMEI` | VARCHAR | Associated device |
| `SimNumber` | VARCHAR | SIM phone number |
| `TelCoId` | INT (FK) | Telecom provider |
| `ActivationDate` | DATE | SIM activation |
| `ExpiryDate` | DATE | SIM expiry |

### `tbltelco`
Telecom provider directory.

### `tblgatewaysms`
SMS gateway configuration for outbound messages.

### `tblemailsettingsys`
Per-app SMTP email configuration.

### `tblemailtemplate`
HTML email templates for system emails.

---

## Configuration & Reference Models

### `tblcountrymgmt`
Countries with dial codes, currency, and timezone.

### `tblcountrystatemgmt`
States/provinces linked to countries.

### `tblstatecitymgmt`
Cities linked to states.

### `tblcurrency`
Currency codes, symbols, and exchange rates.

### `tblsetting`
Key-value system settings store.

### `tblmodulemgmt`
Feature module definitions and visibility rules.

### `tblappversion`
App version tracking per platform.

### `tbldefaultvalue`
Default configuration values per app/country.

---

## Sharing & Social Models

### `tblsharedevice`
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT (PK) | Primary key |
| `DeviceId` | VARCHAR | Shared device IMEI |
| `ShareCode` | VARCHAR | Unique share code |
| `SharedByUserId` | INT (FK) | Sharing user |
| `SharedToUserId` | INT (FK) | Receiving user |
| `IsAccepted` | TINYINT | Acceptance status |
| `ExpiryDate` | DATE | Share expiry |

### `tblsharedemail`
Email invitations for device sharing.

---

## Audit Models

### `tblauditlog`
All user and system actions with before/after values.

### `tblauditloglicence`
Audit trail specifically for licence changes.

### `tblgpsdeletecash`
Records of deleted GPS data for audit purposes.

---

## Product & E-commerce Models

| Model | Description |
|-------|-------------|
| `product` | Hardware product catalog |
| `productattribute` | Attribute types (colour, capacity, etc.) |
| `productattributevalue` | Attribute value options |
| `product_productattribute_mapping` | Product ↔ attribute links |
| `productattributecombination` | SKU combinations |
| `tblproductattributecombinationtierprice` | Volume pricing tiers |

---

## Miscellaneous Models

| Model | Description |
|-------|-------------|
| `tblfavoriteplace` | User's named saved locations |
| `tblfeedback` | User feedback submissions |
| `tblmediamgmt` | Uploaded file/media registry |
| `tbltrackerreport` | Background-processed report queue |
| `tblhandshake` | Device connection handshake log |
| `tblimeinumber` | IMEI number registry |
| `tbliosimeinumbermapping` | iOS device IMEI mapping |
| `tblapiaccessclient` | Third-party API client credentials |
| `tblagentretailer` | Agent-retailer hierarchy mapping |
| `language` | Language definitions |
| `tbllanguageincountry` | Language-country availability |
| `tblserviceenhancement` | Optional feature modules |
| `tblserviceenhancementtype` | Feature type categories |
| `tblserviceenhancementincountry` | Feature availability by country |
| `tblserviceenhancementnotification` | Feature notifications |
| `tbwarrantyreplace` | Device warranty replacements |
