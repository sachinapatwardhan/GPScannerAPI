# Settings & Configuration

## Overview

The system has several layers of configuration: environment-level settings (`.env`), application settings stored in the database, and localization/multi-language support.

---

## System Settings (`/api/v2/settings/`, `/api/v2/mainsetting/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/settings/GetAllSetting` | GET | List all system settings |
| `/settings/GetSettingByKey` | GET | Get setting by key name |
| `/settings/SaveSetting` | POST | Update a system setting |
| `/mainsetting/GetMainSetting` | GET | Get global main settings |
| `/mainsetting/SaveMainSetting` | POST | Update main settings |

---

## App Management (`/api/v2/appsetting/`, `/api/v2/appinfo/`, `/api/v2/appversion/`)

Multiple branded apps can be managed through the system:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/appsetting/GetAllAppName` | GET | List registered app names |
| `/appsetting/GetAllAppVersion` | GET | List app versions |
| `/appsetting/SaveAppVesionInfo` | POST | Register a new app version |
| `/appinfo/GetAllAppInfo` | GET | List app configurations |
| `/appinfo/SaveAppInfo` | POST | Create or update app config |
| `/appinfo/uploadFile` | POST | Upload app icon/image |
| `/appversion/GetAppVersionByName` | GET | Get version info by app name |
| `/appversion/GetAppVersionByAppName` | GET | Alternative version lookup |

### `tblappinfo` Model

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `AppName` | Application name |
| `AppKey` | Unique app identifier |
| `LogoUrl` | App logo image URL |
| `PrimaryColor` | Brand primary color (hex) |
| `SecondaryColor` | Brand secondary color (hex) |
| `CountryId` | Default country for this app |
| `CurrencyId` | Default currency |
| `IsActive` | Active flag |

---

## Email Configuration (`/api/v2/email/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/email/GetAllEmailSetting` | GET | List email configurations |
| `/email/SaveEmailSetting` | POST | Create or update SMTP config |
| `/email/SendEmail` | POST | Send a test/manual email |

### `tblemailsettingsys` Model

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `SMTPHost` | SMTP server hostname |
| `SMTPPort` | SMTP port |
| `SMTPUser` | SMTP username |
| `SMTPPass` | SMTP password |
| `FromAddress` | Sender email address |
| `IsSSL` | Use SSL/TLS |
| `AppId` | Associated application |

---

## Countries & Regions

### Countries (`/api/v2/country/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/country/GetAllCountry` | GET | List all countries |
| `/country/GetCurrentCountry` | GET | Get country for current user |
| `/country/SaveCountry` | POST | Create or update country |
| `/country/GetCountryCode` | GET | List country dial codes |

### States (`/api/v2/state/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/state/GetAllState` | GET | List states/provinces |
| `/state/GetAllStateByCountryId` | GET | States for a country |
| `/state/SaveState` | POST | Create or update state |

### Cities (`/api/v2/city/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/city/GetAllCity` | GET | List all cities |
| `/city/GetAllCityByStateId` | GET | Cities in a state |
| `/city/SaveCity` | POST | Create or update city |

---

## Currency (`/api/v2/currency/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/currency/GetCurrency` | GET | List currencies |
| `/currency/ManageCurrency` | POST | Create or update currency |

---

## Language & Localization

### Languages (`/api/v2/language/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/language/GetAllLanguage` | GET | List all languages |
| `/language/GetAllPublishLanguage` | GET | Published/active languages |
| `/language/SaveLanguage` | POST | Create or update language |
| `/language/uploadImage` | POST | Upload language flag image |

### Language Resources (`/api/v2/languageResources/`)

Mobile app translation strings:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/languageResources/GetMobileLanguageData` | GET | Get translation strings for language |
| `/languageResources/SaveMobileLanguageData` | POST | Save translation strings |
| `/languageResources/ImportMobileLanguageResource` | POST | Bulk import via Excel |

---

## Service Enhancements (`/api/v2/serviceenhancement/`)

Optional feature modules that can be enabled per country/app:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/serviceenhancement/GetAllServiceEnhancement` | GET | List available enhancements |
| `/serviceenhancement/SaveServiceEnhancement` | POST | Enable or configure feature |
| `/serviceenhancement/GetServiceEnhancementByCountry` | GET | Features for a country |

### `tblserviceenhancement` Fields

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `TypeId` | Service enhancement type |
| `Name` | Feature name |
| `IsActive` | Enabled flag |
| `CountryId` | Country availability |

---

## Media Management (`/api/v2/media/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/media/uploadMedia` | POST | Upload image or file |
| `/media/getMedia` | GET | Retrieve media by ID |
| `/media/deleteMedia` | POST | Remove uploaded media |

Uploaded files are stored in the `MediaUploads/` directory.

---

## Feedback (`/api/v2/feedback/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/feedback/GetFeedbackByUser` | GET | List feedback from user |
| `/feedback/saveUserfeedBack` | POST | Submit user feedback |

---

## Modules (`/api/v2/module/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/module/GetAllModule` | GET | List system modules |
| `/module/SaveModule` | POST | Create or update module |

Modules map to `tblmodulemgmt` and control which features are visible per app/user role.

---

## Data Import (`/api/v2/import/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/import/DownloadTemplate` | GET | Download Excel import template |
| `/import/ImportData` | POST | Bulk import data from Excel |
