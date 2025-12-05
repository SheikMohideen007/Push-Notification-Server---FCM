# 🚀 Firebase Cloud Messaging (FCM) Notification Server (Node.js + Express)

A lightweight and production-ready **Push Notification Backend** built using:

- **Node.js**
- **Express**
- **Firebase Admin SDK**
- **FCM (Firebase Cloud Messaging)**

This server allows you to:

- Send notifications to **a single device**
- Send notifications to **multiple devices**
- Send **topic-based** notifications
- Send **data payloads** for deep-link navigation in Flutter apps
- Integrate with Postman or any mobile app backend

---

## 📌 Features

✔ Send push notification to a single device  
✔ Send to multiple devices (multicast)  
✔ Send to FCM topics  
✔ Supports **notification + data** payloads  
✔ Works with **Flutter FCM** + **Awesome Notifications**  
✔ Ready for Android/iOS  
✔ Designed for deployment on Render / Railway / Vercel / AWS

---

## 🏗 Project Structure

notification_server/
│── index.js
│── package.json
│── .env
│── serviceAccountKey.json

## 🔥 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/SheikMohideen007/Push-Notification-Server---FCM.git
cd Push-Notification-Server---FCM
```

### 2️⃣ Install Dependencies

` npm install`

### 3️⃣ Add Firebase Service Account Key

Download this from:

Firebase Console → Project Settings → Service Accounts → Generate private key

Save the file as:

serviceAccountKey.json

⚠️ Never push this file to GitHub
Add it to .gitignore.

---

🔧 Environment Variables (.env)

Create .env:

```
PORT=3000
SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

---

▶️ Start the Server
`node index.js`

Server runs at:
http://localhost:3000

---

### API Endpoints

### ✅ 1. Send Notification to a Single Device

```
POST
/send
```

Body Example

```
{
  "token": "DEVICE_FCM_TOKEN",
  "notification": {
    "title": "New Message",
    "body": "Tap to open details"
  },
  "data": {
    "click_action": "FLUTTER_NOTIFICATION_CLICK",
    "screen": "query_module",
    "id": "REQ123"
  }
}
```

### ✅ 2. Send to Multiple Devices

```
POST
/send-multi
```

Body Example:

```
{
  "tokens": ["TOKEN_1", "TOKEN_2"],
  "notification": {
    "title": "Bulk Message",
    "body": "Sent to multiple devices"
  },
  "data": {
    "type": "bulk"
  }
}
```

✅ 3. Send Topic Notification

```
POST
/send-topic
```

Body Example:

```
{
  "topic": "global",
  "notification": {
    "title": "Hello Everyone!",
    "body": "This is a topic-based push"
  },
  "data": {
    "topic": "global"
  }
}
```

---

### Flutter Client Integration (Example)

This backend works perfectly with Flutter + Firebase Messaging, and supports:

Foreground notifications

Background notifications

Terminated (killed) state notifications

Tap → open specific screen

Data-only messages (for custom navigation)

Notification + Data messages (Android/iOS friendly)

Below is a complete Flutter integration example.

### 🛠 1. Install Required Packages

you can install a latest & stable version

```
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  awesome_notifications: ^0.9.2
```

Run :
`flutter pub get`

### 2. Initialize Firebase & Awesome Notifications

Place this inside main.dart:

```
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Notification channel for Android
  AwesomeNotifications().initialize(
    null,
    [
      NotificationChannel(
        channelKey: 'basic_channel',
        channelName: 'Basic Notifications',
        channelDescription: 'Notification tests',
        importance: NotificationImportance.Max,
      ),
    ],
  );

  // Required for Android background messages
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(MyApp());
}

// Background handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();

  AwesomeNotifications().createNotification(
    content: NotificationContent(
      id: 999,
      channelKey: 'basic_channel',
      title: message.notification?.title ?? message.data["title"],
      body: message.notification?.body ?? message.data["body"],
      payload: message.data,
    ),
  );
}
```

### 3. Request Notification Permission (Android 13+ & iOS)

Call this inside initState() of your main screen:

```
void requestPermission() async {
  NotificationSettings settings = await FirebaseMessaging.instance.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  print("🔔 Permission result: ${settings.authorizationStatus}");
}
```

### 4. Get the FCM Token

```void getFcmToken() async {
  String? token = await FirebaseMessaging.instance.getToken();
  print("🔥 FCM Token: $token");
}
```

You will use this token in Postman or your backend server.

### 5. Foreground Notification Handling

When app is open, Firebase does NOT show notifications automatically.
We manually show a notification using awesome_notifications:

```FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  print("📩 Foreground Message: ${message.data}");

  final title = message.notification?.title ?? message.data["title"];
  final body = message.notification?.body ?? message.data["body"];

  AwesomeNotifications().createNotification(
    content: NotificationContent(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      channelKey: 'basic_channel',
      title: title,
      body: body,
      payload: message.data,
    ),
  );
});
```

### 6. Handle Tap: Background + Killed State

This is the most important part for navigation.

Add a method inside your Home screen:

```
void setupInteractedMessage() async {
  // App opened from terminated state by tapping a notification
  RemoteMessage? initialMessage =
      await FirebaseMessaging.instance.getInitialMessage();

  if (initialMessage != null) {
    _handleMessage(initialMessage);
  }

  // App opened from background by tapping a notification
  FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);
}
```

Tap handler:

```
void _handleMessage(RemoteMessage message) {
  print("📲 Notification Tapped: ${message.data}");

  final screen = message.data["screen"];

  if (screen == "query_module") {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => QueryModule()),
    );
  }

  // You can add more screens
  // if (screen == "vehicle") ...
}
```

Call this inside your initState():

````
@override
void initState() {
  super.initState();
  requestPermission();
  getFcmToken();
  setupInteractedMessage();
}```

***AndroidManifest Configuration (Required)***

Inside <activity> in:

```android/app/src/main/AndroidManifest.xml```

Add:

```<intent-filter>
    <action android:name="FLUTTER_NOTIFICATION_CLICK" />
    <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```
````
