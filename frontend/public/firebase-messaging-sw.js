importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAn9rwRxcqQlplQH7S-ZoN2dbtmEye6PMc",
  authDomain:
    "campusconnect-657d9.firebaseapp.com",
  projectId: "campusconnect-657d9",
  storageBucket:
    "campusconnect-657d9.firebasestorage.app",
  messagingSenderId: "922838363047",
  appId:
    "1:922838363047:web:2c66676918a2075067882"
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  (payload) => {
    console.log(
      "[firebase-messaging-sw.js] Background message:",
      payload
    );

    const title =
      payload.data?.title ||
      payload.notification?.title ||
      "CampusConnect";

    const body =
      payload.data?.body ||
      payload.notification?.body ||
      "You have a new notification.";

    const url =
      payload.data?.url ||
      "/messages";

    self.registration.showNotification(
      title,
      {
        body,
        icon: "/logo192.png",
        data: {
          url,
        },
      }
    );
  }
);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification?.data?.url ||
      "/messages";

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      }).then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }

        return undefined;
      })
    );
  }
);