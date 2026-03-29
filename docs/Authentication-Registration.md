# Authentication & Registration

## 1. Module Purpose

The Authentication & Registration module handles all aspects of identity verification, account creation, session management, and credential management across the **GPScannerAPI / Maark** platform. It spans two primary contexts:

- **Web/Admin Portal** — browser-based login and administrative user creation.
- **Mobile Applications** — mobile-specific login, registration, OTP verification, and app-versioned login flows.
- **Scanner App** — a restricted login path that only allows `Super Admin` or `Scanner` roles.
- **Admin Impersonation** — lets a Super Admin generate a valid JWT for any user account for support purposes.

**Controllers involved:**

| File | Route Prefix | Responsibility |
|---|---|---|
| `controllers/account.js` | `/account` | Login, logout, register, forgot/change password, OTP, admin impersonation |
| `controllers/user.js` | `/user` | Admin-managed user creation (`SaveUser`, `SaveUserNew`, `SaveCustomer`, `SaveUserDistributor`), delete user, upload profile image |

**Supporting models:** `tbluserinformation`, `tbluserinrole`, `tblrole`, `tblemailsettingsys`, `tblemailtemplate`, `tblsetting`, `tblpushnotification`, `tblvehicle`, `tblsharedevice`, `tblsharedemail`.

---

## 2. Business Workflow (Step-by-Step)

### Web Portal Login (`GET /account/login`, `GET /account/loginNew`)
1. Client sends `username` (or email) + `password` + `appId` as query parameters.
2. Server encrypts the submitted password with `jwt.encode(password, "bugz")`.
3. A `findOne` query searches `tbluserinformation` where `username OR email` matches and `password` matches the encrypted value.
4. If the user record is found, all associated roles are fetched from `tbluserinrole` joined with `tblrole`.
5. If the user's `idApp` matches the submitted `appId`, or the user has the `Super Admin` role, a JWT token is generated with `{ username, password, Role[] }` and returned.
6. If neither condition is satisfied, the query is re-executed with the `idApp` filter added; only if that also returns a match does login succeed.
7. The response includes: `token`, `UserId`, `UserImage`, `UserCountry`, `UserRoles`, `RolewiseCountryList`, `appId`.

### Mobile App Login (`GET /account/MobileAppLogin`, `GET /account/MobileAppLoginNew`)
1. Client sends `username` (or `email` or `phone`) + `password` + optionally `idApp`, `AppVersion`, `Platform`.
2. Password is encrypted and the user is located by `username OR email OR phone`.
3. `MobileAppLoginNew` additionally filters by `idApp` and, on success, updates `LastLogin`, `AppVersion`, and `Platform` fields.
4. Roles are fetched and a JWT is issued. Additional fields `Notification`, `SpeedValue`, `IsIgnition` are returned in `MobileAppLoginNew`.

### Scanner App Login (`GET /account/MobileAppLoginScannerApp`)
1. Identical credential flow but the `include` clause filters roles to only `Super Admin` or `Scanner`. Any user without one of those roles receives `{ success: false, message: "Invalid Username or Password..." }`.

### Web Registration (`POST /account/register`)
1. Client POSTs `{ email, username, password, Type, ... }`. If `Type` is absent, defaults to `'Shop'`.
2. Password is encrypted via `jwt.encode(password, "bugz")`.
3. Email format is validated with `validator.isEmail()`. Failure returns `{ success: false, message: "Invalid Email..." }`.
4. Username uniqueness is checked for the same `Type`. Duplicate returns `"Username is already Exist..."`.
5. Email uniqueness is checked for the same `Type`. Duplicate returns `"Email is already Exist..."`.
6. **Type merging:** If the email already exists under a different type (e.g., existing `Owner` registering as `Shop`), the existing record is updated to `Type = 'Both'` and the password is updated — no new record is created.
7. If truly new, `User.create()` is called, then the `User` role is looked up (or created if missing) in `tblrole`, and a `tbluserinrole` record is inserted.
8. Redis cache is refreshed via `updateUserRedisValue()`.

### Mobile Registration (`POST /account/MobileRegister`, `POST /account/MobileRegisterNew`)
1. Email validated with `validator.isEmail()`.
2. Username/email uniqueness checked against `tbluserinformation`. `MobileRegisterNew` additionally scopes by `idApp`.
3. Password encrypted and user created in `tbluserinformation`.
4. `User` role looked up or created, then linked in `tbluserinrole`.
5. `MobileRegisterNew` additionally calls `AddNewShareDevice()` to auto-activate any pending vehicle share invitations for the new email address.

### Check User Existence (`POST /account/CheckUserExist`, `POST /account/CheckMobileUserExist`, `POST /account/CheckMobileUserExistNew`, `POST /account/CheckWebUserExistWithOTPsend`)
1. Email validated.
2. `tbluserinformation` queried for matching `email OR username` (and `idApp` in the `New` variant).
3. Returns whether the user exists, or the specific conflict (username vs. email vs. phone).
4. `CheckWebUserExistWithOTPsend` also sends an OTP SMS via the Nexmo REST API when the user does **not** exist.

### OTP Resend (`GET /account/ResendOTP`)
1. User is located by `id`.
2. `OTP` field is updated to the submitted value via `updateAttributes`.
3. SMS is dispatched via `global.sendSMS()` to the user's registered phone number.

### Forgot Password — Web (`GET /account/forgotpassword`, `GET /account/forgotpasswordNew`)
1. User is located by `id` (legacy) or `email` (new).
2. `forgotpasswordNew` additionally checks the user has the `Super Admin` role, and blocks `demo@maark.my` / `demo@gmail.com`.
3. A new random password is generated with `customPassword()` (6 chars, 2 uppercase, 2 lowercase, 2 digits).
4. New password is encrypted and saved via `updateAttributes`.
5. Email is sent using `tblemailsettingsys` SMTP config, with the `Forgot Password Email` template from `tblemailtemplate`.

### Forgot Password — Mobile (`GET /account/MobileForgotPassword`, `GET /account/MobileForgotPasswordNew`)
1. User located by `email` (and `idApp` in the `New` variant).
2. Blocks `demo@maark.my` / `demo@gmail.com` in the `New` variant.
3. Password regenerated, encrypted, and saved.
4. Email sent using per-app SMTP settings.

### Change Password (`POST /account/changepassword`)
1. Validates `password == confirmpassword`; rejects if mismatch.
2. Validates password length ≥ 2 characters.
3. Verifies old password matches the stored encrypted value.
4. Updates password via `updateAttributes`.

### Change Password — New (`POST /account/changepasswordNew`)
1. Validates password length ≥ 2 characters.
2. Does **not** require confirming the old password.
3. Blocks changes for `demo@maark.my` / `demo@gmail.com` accounts.
4. Sends a `Change Password` email notification after saving.

### Change Password — Admin (`POST /account/changeUserPassword`)
1. Validates new password length ≥ 2 characters.
2. Locates user by `username`.
3. Verifies the current password matches.
4. Updates password.

### Change Password — Mobile (`POST /account/changeMobileUserPassword`, `POST /account/changeMobileUserPasswordNew`)
1. Validates new password length ≥ 2 characters.
2. Verifies old password matches.
3. Updates password and triggers Redis cache refresh.

### Logout — Mobile (`GET /account/MobileApplogout`, `GET /account/MobileApplogoutNew`)
1. Looks up `tblpushnotification` record by `udid` (and optionally `UserType`).
2. Sets `iduser = 0` to disassociate push notifications from the user session.

### Logout — Owner (`GET /account/OwnerMobilelogout`)
1. Identical logic targeting the owner-type push notification entry.

### Set Last Login (`GET /account/SetLastLogin`)
1. Locates user by `id`.
2. Updates `LastLogin` field to current timestamp.
3. Triggers Redis cache refresh.

### Admin Impersonation Login (`POST /account/AdminInpersionateLogin`)
1. Decodes the caller's JWT token.
2. Verifies the caller exists in `tbluserinformation` and has the `Super Admin` role.
3. Looks up the target user by `UserId`.
4. Generates and returns a new JWT token for the target user, allowing the admin to act as that user.

### Admin-Managed User Creation (`POST /user/SaveUser`, `POST /user/SaveUserNew`)
1. JWT token extracted and verified; the calling user must exist.
2. For **create** (`id == 0`): checks access permission (`Added`), validates uniqueness of `username`, `email`, and `phone` (scoped to `idApp` in `SaveUserNew`).
3. A random auto-generated password is created via `customPassword()` (8–10 chars, ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥1 special char).
4. `User.findOrCreate()` is called with the generated password.
5. All existing `tbluserinrole` rows for the user are deleted, then re-created from `objUser.roleId[]`.
6. At least one role must be provided.
7. For **update** (`id != 0`): checks access permission (`Modified`), validates uniqueness excluding self, updates via `User.update()`, then destroys and re-creates roles.

### Customer Creation (`POST /user/SaveCustomer`)
1. Same JWT verification and uniqueness checks as `SaveUserNew`.
2. Fields updated: `email`, `username`, `phone`, `country`, `modifieddate`, `modifiedby`, `idApp`.
3. Roles rebuilt from `objUser.roleId[]`.
4. Password for new customers uses the submitted `objUser.password` (not auto-generated).

### Distributor User Creation (`POST /user/SaveUserDistributor`)
1. Same JWT and uniqueness checks.
2. On create, calls `ManageDistributorUserRole()` which ensures a `Distributor` role exists in `tblrole` then links it in `tbluserinrole`.
3. Password is taken from request body and encrypted with `jwt.encode(password, "bugz")`.

### Delete User (`GET /user/DeleteUser`)
1. JWT verified.
2. `User.destroy()` removes the `tbluserinformation` record by `idUser`.
3. Audit log entry created.

### Password Verification (`GET /account/passwordVerification`)
1. JWT decoded to get `username` and `password`.
2. User found and the stored encrypted password is decoded to plaintext with `jwt.decode(password, "bugz")`.
3. Compared against the submitted `password` query parameter.

---

## 3. Actor Interactions

| Actor | Can Do |
|---|---|
| **Super Admin** | Login to any app, impersonate any user, create/update/delete all user types, change any password, use forgot password flow |
| **Admin (web)** | Login using `GET /account/loginNew`, create/edit users via `SaveUser`/`SaveUserNew`, delete users |
| **Distributor** | Login via web or mobile; created by admin via `SaveUserDistributor` with auto-assigned `Distributor` role |
| **Sales Agent** | Login via web or mobile; created via `SaveUser` |
| **Retailer** | Login via web or mobile; created via `SaveUser` or `salesAgent/registerRetailerAccount` |
| **Customer/User** | Self-register via `/account/register`, `/account/MobileRegister`, or `/account/MobileRegisterNew`; mobile login via `MobileAppLogin`/`MobileAppLoginNew`; admin may create via `SaveCustomer` |
| **Scanner User** | Login only via `MobileAppLoginScannerApp`; must have `Super Admin` or `Scanner` role |

---

## 4. Validation Rules

### Email
- Must pass `validator.isEmail()` check. Applied in: `register`, `CheckUserExist`, `CheckWebUserExistWithOTPsend`, `CheckMobileUserExist`, `CheckMobileUserExistNew`.
- Blocked demo accounts: `demo@maark.my`, `demo@gmail.com` — password cannot be changed via `changepasswordNew` or `forgotpasswordNew` / `MobileForgotPasswordNew`.

### Username
- Must be unique within the same `Type` (register) or within the same `idApp` (SaveUserNew).
- Duplicate check: `User.findOne({ where: { username } })`.

### Phone
- When provided (`phone != ''`), checked for uniqueness against `tbluserinformation` excluding the current user's record.
- Duplicate returns `"Phone is already Exist..."`.

### Password
- Minimum length of **2 characters** enforced in `changepassword`, `changepasswordNew`, `changeUserPassword`, `changeMobileUserPassword`, `changeMobileUserPasswordNew`.
- Auto-generated passwords (`customPassword()` in `user.js`) must satisfy:
  - Length: 8–10 characters
  - ≥ 2 uppercase letters
  - ≥ 2 lowercase letters
  - ≥ 2 digits
  - ≥ 1 special character (`?`, `-`, `^`, `$`, `#`, `@`, `!`, `%`, `&`, `*`)
  - No character repeating 3+ times consecutively
- Auto-generated passwords in `account.js` are shorter (6 chars min/max) and do not require special characters.
- Old password must match stored value in: `changepassword`, `changeUserPassword`, `changeMobileUserPassword`.
- `password` must equal `confirmpassword` in `changepassword`.

### Role
- At least one role must be selected when creating or updating a user via `SaveUser`, `SaveUserNew`, `SaveCustomer`. Failure returns `"Please Select atleast One Role..."`.

### Type (for `/account/register`)
- Defaults to `'Shop'` if not provided.
- Valid values: `'Shop'`, `'Owner'`, `'Both'`.
- Duplicate-email check is type-aware — a `Shop` user can re-register as `Owner`, updating the record to `Type = 'Both'`.

### App Context (`idApp`)
- `loginNew` verifies `user.idApp == req.query.appId`; only Super Admins bypass this.
- `MobileAppLoginNew` strictly requires `idApp` in the query.
- `SaveUserNew`, `SaveCustomer`, `CheckMobileUserExistNew`, `MobileRegisterNew` all scope uniqueness checks by `idApp`.

### JWT Token
- Every write operation in `user.js` (SaveUser, DeleteUser, etc.) requires a valid Bearer token in the `Authorization` header.
- Token is decoded with `jwt.decode(token, TokenKey)`.
- The decoded `username` and `password` are verified against `tbluserinformation`. Failure returns `{ success: false, message: "Invalid Token." }`.

---

## 5. API Endpoints

### `/account` routes

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| GET | `/account/login` | Web portal login | Query: `username`, `password`, `appId` | `{ success, token, UserId, UserRoles, UserImage, UserCountry, RolewiseCountryList, appId }` | No |
| GET | `/account/loginNew` | Web login; filters roles to Super Admin by default but any user whose `idApp` matches can log in | Query: `username`, `password` | `{ success, token, UserId, UserRoles, ... }` | No |
| GET | `/account/Mobilelogin` | Legacy mobile login | Query: `username`, `password`, `idApp` | `{ success, token, UserId, ... }` | No |
| GET | `/account/MobileOwnerlogin` | Mobile owner login | Query: `username`, `password` | `{ success, token, UserId, ... }` | No |
| GET | `/account/MobileAppLogin` | Mobile app login (any app) | Query: `username`, `password` | `{ success, token, UserId, UserName, Email }` | No |
| GET | `/account/MobileAppLoginNew` | Mobile login scoped to app | Query: `username`, `password`, `idApp`, `AppVersion?`, `Platform?` | `{ success, token, UserId, UserName, Email, Notification, SpeedValue, IsIgnition }` | No |
| GET | `/account/MobileAppLoginScannerApp` | Scanner/Admin only mobile login | Query: `username`, `password` | `{ success, token, UserId, UserName, Email }` | No |
| GET | `/account/MobileApplogout` | Mobile logout by UDID | Query: `udid`, `UserType?` | `{ success, message }` | No |
| GET | `/account/MobileApplogoutNew` | Mobile logout (new) | Query: `udid`, `UserType?` | `{ success, message }` | No |
| GET | `/account/OwnerMobilelogout` | Owner mobile logout | Query: `udid` | `{ success, message }` | No |
| GET | `/account/Mobilelogout` | Legacy mobile logout | Query: `udid` | `{ success, message }` | No |
| GET | `/account/SetLastLogin` | Update last login timestamp | Query: `useId` | Updated user object | No |
| POST | `/account/register` | Self-service web registration | Body: `{ email, username, password, Type?, phone?, ... }` | `{ success, message }` | No |
| POST | `/account/MobileRegister` | Mobile self-registration (legacy) | Body: `{ email, username, password, phone, OTP, ... }` | `{ success, message }` | No |
| POST | `/account/MobileRegisterNew` | Mobile registration scoped to app | Body: `{ email, username, password, phone, OTP, idApp, ... }` | `{ success, message, data }` | No |
| POST | `/account/CheckUserExist` | Check username/email availability | Body: `{ email, username, Type? }` | `{ success, message }` | No |
| POST | `/account/CheckMobileUserExist` | Mobile check user existence | Body: `{ email, username }` | `{ success, message }` | No |
| POST | `/account/CheckMobileUserExistNew` | Mobile check user (app-scoped) | Body: `{ email, username, idApp }` | `{ success, message }` | No |
| POST | `/account/CheckWebUserExistWithOTPsend` | Check and send OTP via SMS | Body: `{ email, username, phone, OTP }` | `{ success, message, data }` | No |
| GET | `/account/ResendOTP` | Resend OTP SMS | Query: `idUser`, `OTP` | `{ success, message }` | No |
| GET | `/account/forgotpassword` | Legacy forgot password by user ID | Query: `id`, `AppName` | `{ success, message }` | No |
| GET | `/account/forgotpasswordNew` | Forgot password (Super Admin accounts) | Query: `email`, `idApp`, `AppName` | `{ success, message }` | No |
| GET | `/account/forgotpasswordfromOwnerCustomer` | Forgot password for owner/customer | Query: `email`, `AppName` | `{ success, message }` | No |
| GET | `/account/forgotpasswordfromOwnerCustomerNew` | Forgot password (owner/customer, new) | Query: `email`, `idApp`, `AppName` | `{ success, message }` | No |
| GET | `/account/MobileForgotPassword` | Mobile forgot password (any app) | Query: `email` | `{ success, message }` | No |
| GET | `/account/MobileForgotPasswordNew` | Mobile forgot password (app-scoped) | Query: `email`, `idApp`, `AppName` | `{ success, message }` | No |
| POST | `/account/changepassword` | Change password (with old + confirm) | Body: `{ UserId, oldpassword, password, confirmpassword }` | `{ success, message }` | No |
| POST | `/account/changepasswordNew` | Change password (new UI, no confirm) | Body: `{ UserId, password, AppName }` | `{ success, message }` | No |
| POST | `/account/changeUserPassword` | Change password by username | Body: `{ username, password, NewPassword, Type? }` | `{ success, message }` | No |
| POST | `/account/changeMobileUserPassword` | Mobile change password | Body: `{ username, password, NewPassword }` | `{ success, message }` | No |
| POST | `/account/changeMobileUserPasswordNew` | Mobile change password (new) | Body: `{ username, password, NewPassword }` | `{ success, message }` | No |
| GET | `/account/passwordVerification` | Verify current password against stored | Header: `Authorization: JWT <token>`, Query: `password` | `{ success, message }` | Yes (JWT) |
| GET | `/account/CheckUserPassword` | Simple credential check | Query: `username`, `password`, `idApp` | `{ success, message }` | No |
| POST | `/account/AdminInpersionateLogin` | Admin impersonation login | Body: `{ Token, UserId }` | `{ success, token, UserId, UserName, Email, Notification, SpeedValue, IsIgnition }` | Yes (JWT Super Admin) |

### `/user` routes (authentication-related)

| Method | Endpoint | Description | Request Params/Body | Response | Auth Required |
|---|---|---|---|---|---|
| POST | `/user/SaveUser` | Create or update a user (legacy) | Header: `Authorization`, Body: `{ id, email, username, phone, roleId[], idApp, ... }` | `{ success, message, data }` | Yes (JWT) |
| POST | `/user/SaveUserNew` | Create or update a user (app-scoped) | Header: `Authorization`, Body: `{ id, email, username, phone, roleId[], idApp, ... }` | `{ success, message, data }` | Yes (JWT) |
| POST | `/user/SaveCustomer` | Create or update a customer account | Header: `Authorization`, Body: `{ id, email, username, phone, country, roleId[], idApp, password?, ... }` | `{ success, message, data }` | Yes (JWT) |
| POST | `/user/SaveMobileUser` | Create or update mobile user profile | Header: `Authorization`, Body: `{ ... }` | `{ success, message }` | Yes (JWT) |
| POST | `/user/SaveUserDistributor` | Create or update a distributor user | Header: `Authorization`, Body: `{ id, email, username, phone, password, idApp, ... }` | `{ success, message, data }` | Yes (JWT) |
| GET | `/user/DeleteUser` | Delete a user by ID | Header: `Authorization`, Query: `idUser` | `{ success, message }` | Yes (JWT) |
| POST | `/user/SaveUserInRole` | Assign a role to a user | Header: `Authorization`, Body: `{ userId, roleId }` | `{ success, message }` | Yes (JWT) |
| POST | `/user/uploadImage` | Upload user profile image | Multipart: image file | `{ success, message, data }` | Yes (JWT) |

---

## 6. Database Interactions

### `tbluserinformation`
| Operation | Where | Fields Set / Read |
|---|---|---|
| `findOne` (login) | `username OR email`, `password` | All fields returned; `idApp`, `image`, `country` used in response |
| `findOne` (mobile login) | `username OR email OR phone`, `password`, optional `idApp` | `id`, `username`, `email`, `Notification`, `SpeedValue`, `IsIgnition` |
| `findOne` (existence check) | `email OR username` or `email OR username OR phone` | `id`, `Type`, `phone`, `email`, `username` |
| `create` (register) | — | `email`, `username`, `password`, `phone`, `OTP`, `Type`, `idApp`, and all body fields |
| `findOrCreate` (SaveUser) | `username`, `password` | All body fields as `defaults` |
| `update` (SaveUser update) | `id` | All body fields |
| `updateAttributes` (change password) | — | `password` |
| `updateAttributes` (forgot password) | — | `password` |
| `updateAttributes` (ResendOTP) | — | `OTP` |
| `updateAttributes` (SetLastLogin) | — | `LastLogin` |
| `updateAttributes` (MobileAppLoginNew) | — | `LastLogin`, `AppVersion`, `Platform` |
| `updateAttributes` (Type merge) | — | `Type`, `password`, `MaxSpeed` |
| `destroy` (DeleteUser) | `id` | — |

### `tbluserinrole`
| Operation | Where | Fields Set |
|---|---|---|
| `findAll` (login role fetch) | `userId` | `userId`, `roleId` (with `tblrole` join) |
| `create` (new role assignment) | — | `userId`, `roleId` |
| `destroy` (role rebuild on update) | `userId` | — |

### `tblrole`
| Operation | Where | Fields |
|---|---|---|
| `findOne` (lookup by name) | `RoleName = 'User' / 'Distributor'` | `id`, `RoleName` |
| `create` (if role missing) | — | `RoleName`, `Description` |

### `tblpushnotification`
| Operation | Where | Fields Set |
|---|---|---|
| `findOne` | `udid` (and `UserType` if provided) | — |
| `updateAttributes` (logout) | — | `iduser = 0` |

### `tblemailsettingsys` / `tblemailtemplate` / `tblsetting`
- `findOne` on `tblemailsettingsys` by `IdApp` — provides SMTP credentials.
- `findOne` on `tblemailtemplate` by `Type = "Forgot Password Email"` or `Type = "Change Password"` — provides email subject/body template.
- `findOne` on `tblsetting` by `Name = 'NotificationEmailTo'` — provides BCC address.

---

## 7. Edge Cases & Error Handling

### Invalid / Missing Token
- All authenticated endpoints in `user.js` call `getToken(headers)`. If no token is present: `{ success: false, message: "Invalid Token." }` (global `InvalidToken` constant).
- If the token decodes but the user is not found in `tbluserinformation`: `InvalidToken` response.
- If the user lacks the required access permission: `{ success: false, message: ... }` (global `NoAccessPermission` constant).
- `AdminInpersionateLogin` wraps `jwt.decode` in a try/catch — a malformed token returns `InvalidToken`.

### Duplicate Accounts
- Username already exists (same Type): `"Username is already Exist..."`
- Email already exists (same Type): `"Email is already Exist..."`
- Phone already exists: `"Phone is already Exist..."`
- `register`: If a user registers a second Type (e.g., Owner when Shop exists), the existing record is merged to `Type = 'Both'` instead of rejecting.
- `CheckWebUserExistWithOTPsend` checks `email OR username OR phone` — returns the first specific conflict found.

### Demo Account Protection
- Endpoints `changepasswordNew`, `forgotpasswordNew`, `MobileForgotPasswordNew` explicitly reject changes for accounts with email `demo@maark.my` or `demo@gmail.com` to protect demonstration accounts.

### Email Template / SMTP Missing
- `forgotpassword`, `forgotpasswordNew`, `changepasswordNew`: if no matching email template is found in `tblemailtemplate`, returns `"This Email template not found..."`.
- If `tblemailsettingsys` lookup returns null, returns `"This system Email not found..."`.

### User Not Found
- `forgotpassword` (by `id`): `"This Email not registered with us..."`.
- `forgotpasswordNew` (by `email`): `"This Email not registered with us..."` (implicit — `response == null`).
- `ResendOTP` (by `id`): `"Invalid User"`.
- `SetLastLogin` (by `id`): `"User not found."`.
- `changepassword` / `changeUserPassword` / `changeMobileUserPassword`: `"User is not Exist..."`.

### Wrong Old Password
- `changepassword`: `"Old Password is wrong..."`.
- `changeUserPassword`: `"Old Password is wrong..."`.
- `changeMobileUserPassword`: `"Old Password is wrong..."`.

### Password / Confirm Mismatch
- `changepassword`: `"Password and Confirm Password does not match..."`.

### Minimum Password Length
- Any change-password endpoint: if new password length < 2 characters, returns `"Password contains atleast 2 characters..."` (or `"New Password contains atleast 2 characters..."`).

### No Role Selected
- `SaveUser`, `SaveUserNew`, `SaveCustomer`: if `roleId[]` is empty, returns `"Please Select atleast One Role..."`.

### App ID Mismatch on Login
- `/account/login`: if `user.idApp != appId` and user is not Super Admin, a second query is attempted with `idApp` filter. If that also fails: `"Invalid Username or Password..."`.

### Scanner App Role Gate
- `/account/MobileAppLoginScannerApp`: the `include` WHERE clause restricts roles to `['Super Admin', 'Scanner']`. If the user exists but has no matching role, `findOne` returns null and the response is `"Invalid Username or Password..."`.

### Admin Impersonation Guard
- `AdminInpersionateLogin`: if the calling token's decoded Role array does not include `'Super Admin'`, returns `InvalidToken` — non-admin users cannot impersonate.

### MobileRegisterNew — Share Device Auto-Activation
- After creating a new user, `AddNewShareDevice()` queries `tblsharedemail` for `Status = 'Pending'` records matching the new user's email.
- For each pending share, a `tblsharedevice` record is created and the `tblsharedemail` record is updated to `Status = 'Complete'`.
- If the vehicle or the sharing user cannot be found, the callback returns an error object but does not block user creation.

### OTP SMS Failure
- `ResendOTP`: if `sendSMS()` callback returns `Status != true`, the response includes `success: false` and the provider error message.
