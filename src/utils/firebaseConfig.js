import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig={
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASEAPIKEY || "AIzaSyDMZIxMAkYDMX7CnoP01CkzMl2bgfeodR4",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.AUTHDOMAIN || "dealistaan-2dcf7.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.PROJECTID || "dealistaan-2dcf7",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.STORAGEBUCKET || "dealistaan-2dcf7.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.MESSAGINGSENDERID || "886510650159",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.APPID || "1:886510650159:web:2bfe0f619f66b969b857da",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || process.env.MEASUREMENTID || "G-M1ZK2D1RRK",
}

const app=initializeApp(firebaseConfig);
export const storage=getStorage(app);
