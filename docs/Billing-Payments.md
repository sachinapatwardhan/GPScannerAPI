# Billing & Payments

## Overview

The billing module handles GPS device subscription renewals, order management, pricing tiers, and integration with the CVPay/WebCash payment gateway.

---

## Renewal Management (`/api/v2/billing/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/billing/GetAllRenewData` | GET | List all device renewals |
| `/billing/ExportAllRenewData` | GET | Export renewals to Excel |
| `/billing/GetAllVehicleExpirebyUser` | GET | Vehicles expiring for a user |
| `/billing/GetPriceByApp` | GET | Get renewal pricing for an app |
| `/billing/MakeStatusPaid` | POST | Mark a renewal as paid |
| `/billing/SendPaymentLink` | POST | Send payment link to customer |

---

## Order Service (`/api/v2/billing/`, `/api/v2/orderservice/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/billing/SaveOrderService` | POST | Create a new order |
| `/orderservice/GetAllOrderService` | GET | List all orders |
| `/orderservice/SaveOrderService` | POST | Create or update an order |

### Order Status Flow

```
Created → Pending Payment → Paid → Activated
                                └── Cancelled
```

---

## Payment Gateway Integration

### CVPay / WebCash

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/billing/WebCashResponseUrl` | POST | CVPay payment callback URL |

**Flow:**

1. Server calls CVPay API to initiate payment:
   ```
   POST https://checkout.cvpay.com.my/api/paymentWebapp/initInvoicePayment
   ```
2. Customer is redirected to CVPay checkout
3. CVPay posts result to `/billing/WebCashResponseUrl`
4. Server updates order status and activates renewal

**Required Config:**

```
CVPayMerchantId=<your_merchant_id>
CVPayPaymentURL=https://checkout.cvpay.com.my/api/paymentWebapp/initInvoicePayment
```

---

## Device Renewal Pricing (`/api/v2/devicerenewprice/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/devicerenewprice/GetAllAgentDevicePrice` | GET | Pricing for agent's devices |
| `/devicerenewprice/SaveDevcieRenewPrice` | POST | Create or update pricing tier |
| `/devicerenewprice/DeleteDevicePrice` | POST | Remove a pricing tier |

### Pricing Model: `tbldevicerenewprice`

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `AppId` | Application the price applies to |
| `LicenceType` | Licence tier (Basic, Standard, Premium) |
| `Price` | Renewal price |
| `Duration` | Subscription duration (months) |
| `CurrencyId` | Currency reference |

---

## Renewal Transactions (`/api/v2/renewtransaction/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/renewtransaction/GetAllRenewTransaction` | GET | Full transaction history |
| `/renewtransaction/SaveRenewTransaction` | POST | Record a renewal transaction |

### `tblrenewtransaction` Model

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `DeviceId` | GPS device IMEI |
| `UserId` | Customer user ID |
| `Amount` | Amount paid |
| `PaymentMethod` | Payment method used |
| `TransactionRef` | External transaction reference |
| `RenewFrom` | Previous expiry date |
| `RenewTo` | New expiry date |
| `CreatedAt` | Record creation timestamp |

---

## Billing Service (`/api/v2/billingservice/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/billingservice/SendBillingServiceMail` | GET | Send billing/invoice email to customer |

---

## Licence Management (`/api/v2/licence/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/licence/GetAllLicence` | GET | List all licences |
| `/licence/SaveLicence` | POST | Create or update a licence |
| `/licence/DeleteLicence` | POST | Remove a licence |

### `tbllicencemanager` Model

| Field | Description |
|-------|-------------|
| `Id` | Primary key |
| `AppId` | Application |
| `DeviceId` | Assigned device |
| `UserId` | Assigned user |
| `LicenceType` | Licence category |
| `ExpiryDate` | Licence expiry |
| `IsActive` | Active flag |

---

## Warranty (`/api/v2/warranty/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/warranty/GetAllWarranty` | GET | List warranty records |
| `/warranty/SaveWarranty` | POST | Create warranty record |

### `tbwarrantyreplace` Fields

| Field | Description |
|-------|-------------|
| `DeviceId` | Device IMEI |
| `ReplacementDate` | Date of replacement |
| `Reason` | Reason for replacement |
| `ReplacedBy` | Staff member who replaced |

---

## Products (`/api/v2/product/`)

The system includes a product catalog for hardware sales:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/product/GetAllProduct` | GET | List products |
| `/product/GetProductById` | GET | Get product details |
| `/product/SaveProduct` | POST | Create or update product |

Product attributes, combinations, and tier pricing are managed through related endpoints in `/productAttribute/`, `/productAttributeValue/`, `/productAttributeMapping/`, and `/productAttributeCombination/`.
