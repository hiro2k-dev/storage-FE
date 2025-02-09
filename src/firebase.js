import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDURDov7yNWbfEw5tK-omQjYOI-ne0wq0s',
  authDomain: 'cloud-storage-fed0f.firebaseapp.com',
  projectId: 'cloud-storage-fed0f',
  storageBucket: 'cloud-storage-fed0f.firebasestorage.app',
  messagingSenderId: '696679707723',
  appId: '1:696679707723:web:1e05d61a167cbcca8f49ce',
  measurementId: 'G-MWHVRQL66N',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
