import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDefeDHfVWsDoU9ZUeEcZJq87JAi2qZ34c",
  authDomain: "mitsein-ad8d5.firebaseapp.com",
  projectId: "mitsein-ad8d5",
  storageBucket: "mitsein-ad8d5.firebasestorage.app",
  messagingSenderId: "793060325382",
  appId: "1:793060325382:web:a750df543a5ff1a7792b87",
  measurementId: "G-DX115FPTNR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();