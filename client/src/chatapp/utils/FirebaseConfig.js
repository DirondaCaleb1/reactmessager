import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AlzaSyAPinuM0syQEoLdUzcrMbO6fPsazcjXQn4",
  authDomain: "whatsapp-clone2-9561f.firebaseapp.com",
  projectId: "whatsapp-clone2-9561f",
  storageBucket: "whatsapp-clone2-9561f.appsot.com",
  messagingSenderId: "58218955938",
  appId: "1:58218955938:web:aa0721d0cb6f9ccf9ccf5fc3fb",
  measurementId: "G-QJYYVKBW1T",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
