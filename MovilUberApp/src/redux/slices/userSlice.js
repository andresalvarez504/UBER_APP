import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    uid: null,
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    language: 'es',
    photoURL: '',
    role: 'passenger',
    docId: null,
  },
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => ({
      uid: null,
      fullName: '',
      email: '',
      phone: '',
      gender: '',
      language: 'es',
      photoURL: '',
      role: 'passenger',
      docId: null,
    }),
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;