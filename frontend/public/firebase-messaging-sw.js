importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAn9rwRxcqQlQH7S-ZoN2dbtmEye6PMc",
  authDomain: "campusconnect-657d9.firebaseapp.com",
  projectId: "campusconnect-657d9",
  storageBucket: "campusconnect-657d9.firebasestorage.app",
  messagingSenderId: "922838363047",
  appId: "1:922838363047:web:2c66676918a2075067882"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload
  );
});