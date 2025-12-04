// index.js
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Init firebase-admin
const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

// In-memory token store (for demo). Replace with DB in prod.
const tokens = new Set();

// Endpoint: register device token
app.post('/register-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  tokens.add(token);
  return res.json({ success: true, tokensCount: tokens.size });
});

// Endpoint: unregister token
app.post('/unregister-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  tokens.delete(token);
  return res.json({ success: true, tokensCount: tokens.size });
});

// Endpoint: send a push to a single token
// app.post('/send', async (req, res) => {
//   const { token, title = 'New Notification', body = 'Tap to open', data = {} } = req.body;
//   if (!token) return res.status(400).json({ error: 'token required' });

//   const message = {
//     token,
//     data: {
//       ...Object.keys(data).reduce((acc,k)=>({ ...acc, [k]: String(data[k]) }), {}),
//       title,
//       body,
//     },
//     // For Android, you may want to include android config (optional)
//     android: {
//       priority: 'high',
//       notification: {
//         clickAction: 'FLUTTER_NOTIFICATION_CLICK',
//       },
//     },
//     apns: {
//       payload: {
//         aps: {
//           contentAvailable: true,
//         },
//       },
//     },
//   };

//   try {
//     const resp = await admin.messaging().send(message);
//     return res.json({ success: true, resp });
//   } catch (err) {
//     console.error('send error', err);
//     return res.status(500).json({ error: err.message });
//   }
// });
app.post('/send', async (req, res) => {
    const {
      token,
      notification = {},
      data = {}
    } = req.body;
  
    if (!token) {
      return res.status(400).json({ error: 'token required' });
    }
  
    const message = {
      token,
  
      // SEND NOTIFICATION BLOCK (required for Android BG notifications)
      notification: {
        title: notification.title || 'New Notification',
        body: notification.body || 'Tap to open',
      },
  
      // SEND DATA BLOCK (required for navigation)
      data: {
        ...Object.keys(data).reduce((acc, key) => ({
          ...acc,
          [key]: String(data[key])
        }), {}),
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
  
      android: {
        priority: 'high',
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          channelId: 'basic_channel',  
        },
      },
  
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title || 'New Notification',
              body: notification.body || 'Tap to open'
            },
            sound: "default",
          }
        }
      }
    };
  
    try {
      const resp = await admin.messaging().send(message);
      return res.json({ success: true, resp });
    } catch (err) {
      console.error('send error', err);
      return res.status(500).json({ error: err.message });
    }
  });

// Endpoint: send to many (multicast)
app.post('/send-multi', async (req, res) => {
  const { tokens: inputTokens, title = 'Bulk', body = 'Bulk message', data = {} } = req.body;
  const target = inputTokens && inputTokens.length ? inputTokens : Array.from(tokens);
  if (!target.length) return res.status(400).json({ error: 'no target tokens' });

  const message = {
    tokens: target,
    data: {
      ...Object.keys(data).reduce((acc,k)=>({ ...acc, [k]: String(data[k]) }), {}),
      title,
      body,
    },
  };

  try {
    const resp = await admin.messaging().sendMulticast(message);
    return res.json({ success: true, resp });
  } catch (err) {
    console.error('multicast error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint: send to topic
app.post('/send-topic', async (req, res) => {
  const { topic, title = 'Topic Msg', body = 'Hello', data = {} } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic required' });

  const message = {
    topic,
    data: {
      ...Object.keys(data).reduce((acc,k)=>({ ...acc, [k]: String(data[k]) }), {}),
      title,
      body,
    },
  };

  try {
    const resp = await admin.messaging().send(message);
    return res.json({ success: true, resp });
  } catch (err) {
    console.error('topic send error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint: subscribe tokens to topic (if you want)
app.post('/subscribe', async (req, res) => {
  const { topic, tokens: subTokens } = req.body;
  if (!topic || !subTokens || !subTokens.length) return res.status(400).json({ error: 'topic and tokens required' });

  try {
    const resp = await admin.messaging().subscribeToTopic(subTokens, topic);
    return res.json({ success: true, resp });
  } catch (err) {
    console.error('subscribe error', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FCM server listening on ${PORT}`));
