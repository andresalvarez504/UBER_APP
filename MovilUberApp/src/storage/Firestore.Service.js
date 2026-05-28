import {
  collection, doc, addDoc, getDocs,
  updateDoc, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from './Firebase.config';

// ── USERS ─────────────────────────────────────────────
export const createUser = async (uid, userData) => {
  await addDoc(collection(db, 'users'), {
    uid, ...userData, role: 'passenger', createdAt: Timestamp.now(),
  });
};

export const getUserById = async (uid) => {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, docId: d.id, ...d.data() };
};

export const updateUser = async (docId, data) => {
  await updateDoc(doc(db, 'users', docId), data);
};

// ── VEHICLE TYPES ──────────────────────────────────────
export const getVehicleTypes = async () => {
  const snapshot = await getDocs(collection(db, 'vehicleTypes'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── TRIPS ──────────────────────────────────────────────
export const createTrip = async (tripData) => {
  const ref = await addDoc(collection(db, 'trips'), {
    ...tripData,
    status: 'requested',
    createdAt: Timestamp.now(),
  });
  return ref.id;
};

// ── TRIP HISTORY — lee directo de trips por uid ────────
export const getTripHistory = async (uid) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('passengerId', '==', uid),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      origin: d.data().originName,
      destination: d.data().destName,
      fare: d.data().fare,
      status: d.data().status,
      vehicleType:
        d.data().vehicleTypeId === 'economy' ? 'Económico' :
        d.data().vehicleTypeId === 'xl' ? 'XL' : 'Premium',
      date: d.data().createdAt,
    }));
  } catch (e) {
    console.log('getTripHistory error:', e);
    return [];
  }
};