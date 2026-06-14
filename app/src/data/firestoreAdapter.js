import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/** Live adapter, thin wrapper around the Firestore SDK. */
export const firestoreAdapter = {
  subscribeCollection(name, callback) {
    if (!db) {
      callback([]);
      return () => {};
    }
    return onSnapshot(collection(db, name), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  subscribeDoc(name, id, callback) {
    if (!db) {
      callback(null);
      return () => {};
    }
    return onSnapshot(doc(db, name, id), (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },

  async addDoc(name, data) {
    const ref = await addDoc(collection(db, name), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateDoc(name, id, patch) {
    await updateDoc(doc(db, name, id), { ...patch, updatedAt: serverTimestamp() });
  },

  async setDoc(name, id, data) {
    await setDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  },

  async deleteDoc(name, id) {
    await deleteDoc(doc(db, name, id));
  },
};
