import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "git-hub-readme.firebaseapp.com",
  projectId: "git-hub-readme",
  storageBucket: "git-hub-readme.firebasestorage.app",
  messagingSenderId: "594054220855",
  appId: "1:594054220855:web:7e74a360ffd28821ec83b2",
  measurementId: "G-G22PE4XKG3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };
