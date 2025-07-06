import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyCjZ-5-zv7BQnOTGC8NFR_44_tvBE22yqQ",
    authDomain: "maxmoneyqueuesystem.firebaseapp.com",
    projectId: "maxmoneyqueuesystem",
    storageBucket: "maxmoneyqueuesystem.firebasestorage.app",
    messagingSenderId: "66791874772",
    appId: "1:66791874772:web:39c08b5c7ff4dfed1a1b41",
    measurementId: "G-W7DD077952",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
