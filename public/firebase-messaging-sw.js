importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCjZ-5-zv7BQnOTGC8NFR_44_tvBE22yqQ",
    authDomain: "maxmoneyqueuesystem.firebaseapp.com",
    projectId: "maxmoneyqueuesystem",
    storageBucket: "maxmoneyqueuesystem.firebasestorage.app",
    messagingSenderId: "66791874772",
    appId: "1:66791874772:web:39c08b5c7ff4dfed1a1b41",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
