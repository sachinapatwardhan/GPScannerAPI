# User Management

## Overview

The system supports a **multi-tier user hierarchy**: Super Admin → Admin → Distributor → Retailer → Sales Agent → Customer. Each tier has specific permissions and visibility scopes.

---

## User Hierarchy

```
Super Admin
    └── Admin (per App/Region)
            └── Distributor
                    └── Retailer
                            └── Sales Agent
                                    └── Customer / Owner
```

---

## User Endpoints (`/api/v2/user/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/GetAllUser` | GET | List all users (admin) |
| `/user/GetUserById` | GET | Get user details by ID |
| `/user/SaveUser` | POST | Create or update a user |
| `/user/SaveUserNew` | POST | Create user (new format) |
| `/user/UpdateMobileUser` | POST | Update mobile user profile |
| `/user/GetUserProfile` | GET | Get authenticated user's profile |
| `/user/SaveCustomer` | POST | Create a customer account |

### `tbluserinformation` Model

| Field | Description |
|-------|-------------|
| `id` | Primary key |
| `email` | Email / login username |
| `username` | Display name |
| `password` | Hashed password |
| `phone` | Phone number |
| `country` | Country ID |
| `gender` | M / F / Other |
| `OTP` | One-time password for verification |
| `AppVersion` | Last used app version |
| `Platform` | `Android` / `iOS` / `Web` |
| `SpeedValue` | Default speed unit preference |
| `IdleMinute` | Idle threshold (minutes) |
| `Amount` | Wallet/credit balance |

---

## Roles (`/api/v2/role/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/role/GetAllRole` | GET | List all roles |
| `/role/SaveRole` | POST | Create or update a role |

### `tblrole` Model

| Field | Description |
|-------|-------------|
| `id` | Primary key |
| `RoleName` | Role display name |
| `Description` | Role description |

---

## Permissions (`/api/v2/userPermission/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/userPermission/GetAllPermission` | GET | List permissions |
| `/userPermission/SavePermission` | POST | Create or update permission |
| `/userPermission/AssignPermission` | POST | Assign permissions to role |

---

## Admin (`/api/v2/admin/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/getAutocompleteSalesAgent` | GET | Autocomplete sales agent list |
| `/admin/getAllGpsDevices` | GET | All GPS devices in system |
| `/admin/assignDevice` | POST | Assign device to user |
| `/admin/assignDeviceByExcel` | POST | Bulk device assignment via Excel |
| `/admin/downloadAssignDeviceExcelTemplate` | GET | Download assignment template |

---

## Distributors (`/api/v2/distributor/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/distributor/GetAllGPSDeviceForDistributor` | GET | Devices visible to distributor |
| `/distributor/GetAllDynamicOwnerCustomerForDistributor` | GET | Customers under distributor |
| `/distributor/GetAllRenewData` | GET | Renewals for distributor's devices |
| `/distributor/SaveDistributor` | POST | Create distributor account |

---

## Retailers (`/api/v2/retailer/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/retailer/GetAllRetailer` | GET | List all retailers |
| `/retailer/SaveRetailer` | POST | Create or update retailer |

---

## Sales Agents (`/api/v2/salesAgent/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/salesAgent/GetAllSalesAgent` | GET | List sales agents |
| `/salesAgent/SaveSalesAgent` | POST | Create sales agent |

---

## Assignment Chains

### Assign Retailer to Distributor (`/api/v2/assignretailer/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/assignretailer/GetAllSalesAgent` | GET | Sales agents for assignment |
| `/assignretailer/SaveAssignRetailer` | POST | Assign retailer to distributor |
| `/assignretailer/removeAssignRetailer` | POST | Remove assignment |

### Assign Agent to Retailer (`/api/v2/assignagentretailer/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/assignagentretailer/GetAllAgent` | GET | Available agents |
| `/assignagentretailer/GetAllAgentRetailer` | GET | Agent-retailer mappings |
| `/assignagentretailer/SaveAgentDeviceRetailer` | POST | Create assignment |

### Assign Device to Distributor (`/api/v2/assigndistributor/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/assigndistributor/GetAllDistributor` | GET | List distributors |
| `/assigndistributor/SaveDeviceDistributor` | POST | Assign device to distributor |

---

## Device Sharing (`/api/v2/sharedevice/`)

Users can share device access with other accounts:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sharedevice/GetAllShareDeviceByUser` | GET | Devices shared with current user |
| `/sharedevice/GetShareDeviceRequestForUser` | GET | Pending share requests |
| `/sharedevice/SaveShareDevice` | POST | Send share invitation |
| `/sharedevice/AcceptShareDevice` | POST | Accept share invitation |
| `/sharedevice/DeleteShareDevice` | POST | Remove device share |

---

## Customers (`/api/v2/customers/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/customers/GetAddressLatLong` | GET | Geocode an address to coordinates |
| `/customers/GetLatLongAddress` | GET | Reverse geocode coordinates |
| `/customers/SendOTP` | POST | Send OTP to phone number |

---

## API Access Control (`/api/v2/apiaccess/`)

Third-party integrations can be given scoped API access:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/apiaccess/GetAllAccessClient` | GET | List API clients |
| `/apiaccess/SaveAccessClient` | POST | Register new API client |
| `/apiaccess/giveAccess` | POST | Grant access to a client |

---

## Audit Log (`/api/v2/auditlog/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auditlog/GetAllAditlog` | GET | Full system audit log |
| `/auditlog/GetAllGPSDeleteData` | GET | Log of deleted GPS records |

### `tblauditlog` Model

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `UserId` | User who performed action |
| `Action` | Action performed |
| `TableName` | Affected table |
| `RecordId` | Affected record ID |
| `OldValue` | Previous value (JSON) |
| `NewValue` | New value (JSON) |
| `CreatedAt` | Timestamp |
