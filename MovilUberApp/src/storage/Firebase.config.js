import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAc5lLYzi7gtArJx-inorlm0PD3MDL-eUs",
  authDomain: "uber-4f487.firebaseapp.com",
  projectId: "uber-4f487",
  storageBucket: "uber-4f487.firebasestorage.app",
  messagingSenderId: "1054455995519",
  appId: "1:1054455995519:web:a80e60c0703d7da131b34a",
  measurementId: "G-YN2Z83KCXW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 