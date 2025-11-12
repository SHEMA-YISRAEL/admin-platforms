import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByx1U020Jx23zxI6Fkh8l_IKZBP1pQNg8",
  authDomain: "synappquizz-f7b4b.firebaseapp.com",
  projectId: "synappquizz-f7b4b",
  storageBucket: "synappquizz-f7b4b.firebasestorage.app",
  messagingSenderId: "898109267312",
  appId: "1:898109267312:web:6226875dd786b0bd67c3b5",
  measurementId: "G-004VNLFQLP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addDocumentToCollection(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

addDocumentToCollection("adminUsers", {
  name: "English-Translator",
  user: "englishtranslator@topoquizz.com",
  // pass: '123456',
  rol: 'translator',
  permission: [
    'canEditEnglishTranslate',
    'canViewSpanishQuestionsVersion'
  ]
});

addDocumentToCollection("adminUsers", {
  name: "Korean-Translator",
  user: "korean@translator",
  pass: '123456',
  rol: 'translator',
  permission: [
    'canEditKoreanTranslate',
    'canViewSpanishQuestionsVersion'
  ]
});

addDocumentToCollection("adminUsers", {
  name: "Portuguese-Translator",
  user: "portuguese@translator",
  pass: '123456',
  rol: 'translator',
  permission: [
    'canEditportugueseTranslate',
    'canViewSpanishQuestionsVersion'
  ]
});
addDocumentToCollection("adminUsers", {
  name: "German-Translator",
  user: "german@translator",
  pass: '123456',
  rol: 'translator',
  permission: [
    'canEditGermanTranslate',
    'canViewSpanishQuestionsVersion'
  ]
});
