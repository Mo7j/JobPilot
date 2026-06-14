import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { firebaseConfig, hasFirebaseConfig } from './config';

const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

async function getMessagingInstance() {
  if (!firebaseApp) return null;
  const supported = await isSupported();
  return supported ? getMessaging(firebaseApp) : null;
}

async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase is not configured.');
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

async function signOutUser() {
  if (!auth) return;
  await signOut(auth);
}

export { auth, db, firebaseApp, getMessagingInstance, signInWithEmail, signOutUser };
