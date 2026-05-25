import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './Firebase.config';

// ── USERS ────────────────────────────────────────────
export const createUser = async (uid, userData) => {
  await addDoc(collection(db, 'users'), {
    uid,
    ...userData,
    role: 'passenger',
    createdAt: Timestamp.now(),
  });
};

export const getUserById = async (uid) => {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const updateUser = async (docId, data) => {
  const ref = doc(db, 'users', docId);
  await updateDoc(ref, data);
};

// ── TRIPS ────────────────────────────────────────────
export const createTrip = async (tripData) => {
  const ref = await addDoc(collection(db, 'trips'), {
    ...tripData,
    status: 'requested',
    createdAt: Timestamp.now(),
  });
  return ref.id;
};

export const getTripsByPassenger = async (passengerId) => {
  const q = query(
    collection(db, 'trips'),
    where('passengerId', '==', passengerId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── VEHICLE TYPES ─────────────────────────────────────
export const getVehicleTypes = async () => {
  const snapshot = await getDocs(collection(db, 'vehicleTypes'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── TRIP HISTORY ──────────────────────────────────────
export const getTripHistory = async (userId) => {
  const q = query(
    collection(db, 'users', userId, 'tripHistory'),
    orderBy('date', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};