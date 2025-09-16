
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig={
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER0_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID

    // API_KEY=AIzaSyByx1U020Jx23zxI6Fkh8l_IKZBP1pQNg8
    // AUTH_DOMAIN=synappquizz-f7b4b.firebaseapp.com
    // PROJECT_ID=synappquizz-f7b4b
    // STORAGE_BUCKET=synappquizz-f7b4b.firebasestorage.app
    // MESSAGING_SENDER0_ID=898109267312
    // APP_ID=1:898109267312:web:6226875dd786b0bd67c3b5
    // MEASUREMENT_ID=G-004VNLFQLP

    // apiKey:'AIzaSyByx1U020Jx23zxI6Fkh8l_IKZBP1pQNg8' ,
    // authDomain:'synappquizz-f7b4b.firebaseapp.com',
    // projectId: 'synappquizz-f7b4b',
    // storageBucket: 'synappquizz-f7b4b.firebasestorage.app',
    // messagingSenderId: '898109267312',
    // appId: '898109267312:web:6226875dd786b0bd67c3b5'
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);