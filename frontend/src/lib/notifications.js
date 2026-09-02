import {
  getFirebaseMessaging,
  registerMessaging,
  onRegistered,
  onUnregistered,
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

    onRegistered(
      messaging,
      async (installationId) => {
        try {
          console.log(
            "FCM Installation ID:",
            installationId
          );

          await api.post(
            "/notifications/register",
            {
              installation_id:
                installationId,
            }
          );

          console.log(
            "FCM installation registered on server."
          );
        } catch (error) {
          console.error(
            "Failed to save FCM installation:",
            error
          );
        }
      }
    );

    onUnregistered(
      messaging,
      async (installationId) => {
        try {
          await api.delete(
            "/notifications/register",
            {
              data: {
                installation_id:
                  installationId,
              },
            }
          );

          console.log(
            "FCM installation removed from server."
          );
        } catch (error) {
          console.error(
            "Failed to remove FCM installation:",
            error
          );
        }
      }
    );

    await registerMessaging(
      messaging,
      {
        vapidKey:
          process.env
            .REACT_APP_FIREBASE_VAPID_KEY,

        serviceWorkerRegistration,
      }
    );

    console.log(
      "FCM registration completed."
    );
  } catch (error) {
    console.error(
      "Push notification setup failed:",
      error
    );

    registrationStarted = false;
  }
}