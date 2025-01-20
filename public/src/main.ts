// src/main.ts
import App from './App.svelte'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initialize Firebase with config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "butchers-daughter.firebaseapp.com",
  projectId: "butchers-daughter",
  storageBucket: "butchers-daughter.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const appInstance = new App({
  target: document.getElementById('app'),
  props: {
    url: window.location.pathname
  }
})

export default appInstance