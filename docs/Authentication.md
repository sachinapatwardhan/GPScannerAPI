# Authentication

GPScannerAPI uses **JWT (JSON Web Token)** Bearer token authentication for all protected endpoints.

---

## Login Endpoints

All login endpoints are under `/api/v2/account/`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/account/login` | POST | Web dashboard login |
| `/account/loginNew` | POST | Updated login method |
| `/account/Mobilelogin` | POST | Mobile app login |
| `/account/MobileOwnerlogin` | POST | Mobile owner login |
| `/account/MobileAppLogin` | POST | Mobile app alternative login |
| `/account/register` | POST | New user registration |
| `/account/MobileRegister` | POST | Mobile user registration |
| `/account/forgotpassword` | POST | Send password reset |
| `/account/changepassword` | POST | Change password |
| `/account/CheckMobileUserExist` | POST | Check if mobile user exists |

---

## Obtaining a Token

### Request

```http
POST /api/v2/account/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "yourpassword"
}
```

### Response

```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "role": "Admin"
  }
}
```

---

## Using the Token

Include the token as a **Bearer** token in the `Authorization` header of every protected request:

```http
GET /api/v2/vehicles/GetAllDynamicVehicle
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## Token Extraction (Internal)

The server extracts and validates tokens using the following utility function:

```javascript
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
    return null;
  }
  return null;
};

// Usage in a controller:
var token = getToken(req.headers);
if (token) {
  var decoded = jwt.decode(token, TokenKey);
  // proceed with decoded.id / decoded.role
}
```

---

## Token Payload

The JWT payload contains the authenticated user's information:

| Field | Description |
|-------|-------------|
| `id` | User's unique ID |
| `username` | User's email/username |
| `role` | User role (Admin, Distributor, Retailer, etc.) |
| `appId` | Associated application ID |
| `countryId` | User's country |

---

## Roles & Access Levels

| Role | Access |
|------|--------|
| **Super Admin** | Full system access |
| **Admin** | Manage own users, vehicles, devices |
| **Distributor** | Manage own retailers and their devices |
| **Retailer** | Manage own customers and devices |
| **Sales Agent** | View and update assigned devices |
| **Customer / Owner** | View own vehicles only |

---

## Mobile Login

For mobile apps, use the `/account/MobileAppLogin` endpoint. The request includes the device's platform and version:

```http
POST /api/v2/account/MobileAppLogin
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "yourpassword",
  "Platform": "Android",
  "AppVersion": "2.1.0"
}
```

---

## Password Reset Flow

1. Call `POST /account/forgotpassword` with `{ "email": "user@example.com" }`
2. Server sends an OTP or reset link to the registered email
3. Use the OTP/link to call `POST /account/changepassword` with new credentials

---

## Security Notes

- JWT secret key is stored in the `TokenKey` environment variable
- Passwords are hashed before storage
- CORS is configured to allow all origins (`*`) — restrict to known domains in production
- Tokens do not expire by default; implement token expiry for production security
