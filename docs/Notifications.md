# Notifications & Alerts

## Overview

The system supports multiple notification channels: Firebase push notifications (Android/iOS), Apple APN (iOS), Nexmo SMS, and in-app socket events.

---

## Push Notifications (`/api/v2/pushnotification/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pushnotification/GetAllNotification` | GET | List all push notifications |
| `/pushnotification/SaveNotification` | POST | Create or send a notification |
| `/pushnotification/DeleteNotification` | POST | Delete a notification |

---

## Notification Settings (`/api/v2/NotificationSetting/`)

Users can configure which events trigger notifications:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/NotificationSetting/GetAllNotification` | GET | Get all notification settings |
| `/NotificationSetting/ChangeMainNotification` | POST | Enable/disable all notifications |
| `/NotificationSetting/ChangeNotificationSetting` | POST | Configure specific notification type |

### Notification Types

| Type | Description |
|------|-------------|
| **SOS** | Emergency SOS button pressed |
| **Geofence In** | Vehicle entered a geofence zone |
| **Geofence Out** | Vehicle exited a geofence zone |
| **Speed Alert** | Vehicle exceeded speed limit |
| **Engine On/Off** | Ignition status changed |
| **Power Cut** | External power disconnected |
| **Low Battery** | Device battery low |
| **Anti-Tamper** | Wiring tamper detected |
| **Door Open** | Door opened |

---

## Firebase Push Notifications

Firebase Cloud Messaging (FCM) is used for Android and cross-platform push.

**Setup:** Place your Firebase Admin SDK JSON file at the project root:
```
hc-cargo-<project-id>-firebase-adminsdk-<key>.json
```

**Firebase config is loaded via:**
```javascript
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

---

## Apple Push Notifications (APN)

iOS push notifications use APNs certificates stored in the `certs/` directory.

```javascript
var apnProvider = new apn.Provider({
  cert: './certs/cert.pem',
  key: './certs/key.pem',
  production: true  // false for sandbox
});
```

---

## SMS Notifications (Nexmo / Vonage)

OTP and alert SMS messages are sent via Nexmo:

```
SMSAPIkey=<your-nexmo-api-key>
SMSapisecret=<your-nexmo-api-secret>
```

**Used for:**
- User OTP verification (`/customers/SendOTP`)
- Password reset codes
- SOS alert SMS to emergency contacts

---

## PWA Push Notifications

Web Push (PWA) subscriptions are stored in `tblpwa_notification_subscription` and support browser-based push notifications.

---

## Alarms (`/api/v2/gpsdata/`)

Device-generated alarms are captured from GPS packets and stored in `tblalarm`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gpsdata/GetAllAlarm` | GET | Retrieve all alarms |

### Alarm Types

| Alarm | Trigger |
|-------|---------|
| **SOS** | SOS button on device |
| **Speed** | Vehicle speed > configured limit |
| **Geofence** | Fence in/out event |
| **Engine** | Ignition change |
| **Power** | External power loss |
| **Tamper** | Anti-tamper wire |
| **Low Battery** | Battery below threshold |

---

## SOS Alerts (`tblsos`)

SOS events are given special handling:
- Stored separately in `tblsos`
- Triggers immediate push notification
- Sends SMS to emergency contacts
- Creates audit log entry

---

## Pet Device Alarms (`/api/v2/petAlarm/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/petAlarm/GetAllPetAlarm` | GET | List pet device alarms |
| `/petAlarm/SavePetAlarm` | POST | Create pet alarm configuration |

---

## Real-time Alarm Broadcast

When an alarm condition is detected during GPS data processing:

```
GPS packet received
    │
    ▼
Alarm condition detected (speed, fence, SOS, etc.)
    │
    ├── Insert row into tblalarm
    ├── Send push notification (Firebase/APN)
    ├── Send SMS if configured (Nexmo)
    └── Emit 'DeviceAlarm' socket event to user's room
```

Socket event payload (`DeviceAlarm`):
```json
{
  "DeviceId": "359123456789012",
  "AlarmType": "SOS",
  "Latitude": 3.1390,
  "Longitude": 101.6869,
  "Datetime": "2024-01-15T10:30:00Z",
  "Speed": 0
}
```
