import {
  getFirebaseMessaging,
  getToken,
  onMessage,
} from "./firebase";

import api from "./api";

let registrationStarted = false;

export async function setupPushNotifications() {
  console.log("=================================");
  console.log("FCM SETUP STARTED");
  console.log("=================================");

  if (registrationStarted) {
    console.log("FCM setup already started.");
    return;
  }

  registrationStarted = true;

  try {
    console.log(
      "Notification support:",
      "Notification" in window
    );

    console.log(
      "Service worker support:",
      "serviceWorker" in navigator
    );

    console.log(
      "Current permission:",
      Notification.permission
    );

    if (!("Notification" in window)) {
      console.log(
        "FCM ERROR: Notifications not supported"
      );
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.log(
        "FCM ERROR: Service workers not supported"
      );
      return;
    }

    if (Notification.permission === "denied") {
      console.log(
        "FCM ERROR: Notification permission denied"
      );
      return;
    }

    let permission =
      Notification.permission;

    if (permission !== "granted") {
      permission =
        await Notification.requestPermission();
    }

    console.log(
      "Notification permission result:",
      permission
    );

    if (permission !== "granted") {
      console.log(
        "FCM ERROR: Permission not granted"
      );
      return;
    }

    console.log(
      "Registering Firebase service worker..."
    );

    const serviceWorkerRegistration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log(
      "Service worker registered:",
      serviceWorkerRegistration
    );

    const messaging =
      await getFirebaseMessaging();

    console.log(
      "Firebase messaging object:",
      messaging
    );

    if (!messaging) {
      console.log(
        "FCM ERROR: Firebase Messaging unsupported"
      );
      return;
    }

    console.log(
      "Calling getToken()..."
    );

    const token = await getToken(
      messaging,
      {
        vapidKey:
          process.env
            .REACT_APP_FIREBASE_VAPID_KEY,

        serviceWorkerRegistration,
      }
    );

    console.log(
      "FCM TOKEN:",
      token
    );

    if (!token) {
      console.log(
        "FCM ERROR: No token returned"
      );
      return;
    }

    console.log(
      "Sending FCM token to backend..."
    );

    const response = await api.post(
      "/notifications/register",
      {
        installation_id: token,
      }
    );

    console.log(
      "Backend registration response:",
      response.data
    );

    console.log(
      "FCM TOKEN SUCCESSFULLY REGISTERED"
    );

    onMessage(messaging, (payload) => {
  console.log("Foreground FCM:", payload);
  new Notification(payload.notification?.title || "CampusConnect", {
    body: payload.notification?.body || "New message",
    icon: "/logo192.png",
  });
});

  } catch (error) {

    console.error(
      "FCM SETUP FAILED:",
      error
    );

    console.error(
      "FCM ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "FCM ERROR CODE:",
      error?.code
    );

    registrationStarted = false;
  }
}