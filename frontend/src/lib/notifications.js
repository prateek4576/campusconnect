import {
  getFirebaseMessaging,
  getToken,
  onMessage,
} from "./firebase";

import api from "./api";

let registrationStarted = false;

export async function setupPushNotifications() {
  if (registrationStarted) {
    return;
  }

  registrationStarted = true;

  try {
    if (!("Notification" in window)) {
      console.log(
        "Notifications are not supported by this browser."
      );
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.log(
        "Service workers are not supported."
      );
      return;
    }

    if (Notification.permission === "denied") {
      console.log(
        "Notification permission has been denied."
      );
      return;
    }

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      console.log(
        "Notification permission was not granted."
      );
      return;
    }

    const serviceWorkerRegistration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    const messaging =
      await getFirebaseMessaging();

    if (!messaging) {
      console.log(
        "Firebase Messaging is not supported."
      );
      return;
    }

    const token = await getToken(messaging, {
      vapidKey:
        process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (token) {
      try {
        await api.post(
          "/notifications/register",
          { installation_id: token }
        );

        console.log(
          "FCM token registered on server."
        );
      } catch (error) {
        console.error(
          "Failed to save FCM token:",
          error
        );
      }
    } else {
      console.log(
        "No registration token available."
      );
    }

    onMessage(messaging, (payload) => {
      console.log(
        "Foreground message received:",
        payload
      );
      // Optional: show an in-app toast/banner here.
      // Background/closed-tab notifications are handled
      // separately in firebase-messaging-sw.js.
    });
  } catch (error) {
    console.error(
      "Push notification setup failed:",
      error
    );

    registrationStarted = false;
  }
}