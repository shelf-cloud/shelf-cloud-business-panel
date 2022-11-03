// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBHShGd9H8llo3NhE7cbP9svv8dHt865TA',
  authDomain: 'etiquetas-fba.firebaseapp.com',
  projectId: 'etiquetas-fba',
  storageBucket: 'etiquetas-fba.appspot.com',
  messagingSenderId: '185913292585',
  appId: '1:185913292585:web:fef208bc585c9fabd76938',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

export { app, storage }
