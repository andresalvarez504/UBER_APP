import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/slices/userSlice';
import { updateUser } from '../storage/Firestore.Service';
import { signOut } from 'firebase/auth';
import { auth } from '../storage/Firebase.config';
import CustomButton from '../components/CustomButton';

const GENDERS = ['Masculino', 'Femenino', 'Prefiero no decir'];
const LANGUAGES = [{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }];

const ConfigUserScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [gender, setGender] = useState(user.gender || '');
  const [language, setLanguage] = useState(user.language || 'es');
  const [photo, setPhoto] = useState(user.photoURL || null);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const uri = response.assets?.[0]?.uri;
      if (uri) setPhoto(uri);
    });
  };

  const handleSave = async () => {
    if (!fullName || !phone || !gender) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    if (fullName.length > 50) {
      Alert.alert('Error', 'El nombre no puede superar 50 caracteres.');
      return;
    }
    if (!/^\d+$/.test(phone)) {
      Alert.alert('Error', 'El número de celular solo debe contener dígitos.');
      return;
    }
    setLoading(true);
    try {
      if (user.docId) {
        await updateUser(user.docId, { fullName, phone, gender, language, photoURL: photo || '' });
      }
      dispatch(setUser({ fullName, phone, gender, language, photoURL: photo || '' }));
      Alert.alert('¡Listo!', 'Perfil actualizado correctamente.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive', onPress: async () => {
          await signOut(auth);
          dispatch(clearUser());
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{fullName.charAt(0).toUpperCase() || '?'}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.emailLabel}>{user.email}</Text>

        {/* Datos personales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos personales</Text>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input} value={fullName} onChangeText={setFullName}
            placeholderTextColor="#444" maxLength={50} placeholder="Máximo 50 caracteres"
          />

          <Text style={styles.label}>Número de celular *</Text>
          <TextInput
            style={styles.input} value={phone} onChangeText={setPhone}
            placeholderTextColor="#444" keyboardType="numeric" placeholder="Ej: 3001234567"
          />

          <Text style={styles.label}>Género *</Text>
          <View style={styles.optionRow}>
            {GENDERS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.option, gender === g && styles.optionSelected]}
                onPress={() => setGender(g)}>
                <Text style={[styles.optionText, gender === g && styles.optionTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Idioma</Text>
          <View style={styles.optionRow}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.value}
                style={[styles.option, language === l.value && styles.optionSelected]}
                onPress={() => setLanguage(l.value)}>
                <Text style={[styles.optionText, language === l.value && styles.optionTextSelected]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <CustomButton title="Guardar cambios" onPress={handleSave} loading={loading} />

        <TouchableOpacity
          style={styles.changePassBtn}
          onPress={() => navigation.navigate('ChangePassword')}>
          <Text style={styles.changePassText}>🔒 Cambiar contraseña</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  logoutBtn: { backgroundColor: '#FF444422', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  logoutText: { color: '#FF4444', fontWeight: '700', fontSize: 13 },
  avatarWrap: { alignSelf: 'center', marginBottom: 10, position: 'relative' },
  avatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFC61A' },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFC61A',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFC61A',
  },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#000' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#222',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0A0A0A',
  },
  cameraIcon: { fontSize: 14 },
  emailLabel: { color: '#555', textAlign: 'center', marginBottom: 28, fontSize: 13 },
  section: {
    backgroundColor: '#161616', borderRadius: 20, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: '#222',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFC61A', marginBottom: 16 },
  label: { color: '#777', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0A0A0A', color: '#FFF', borderRadius: 12,
    paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#2A2A2A',
    fontSize: 15,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  option: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 24,
    borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#0A0A0A',
  },
  optionSelected: { backgroundColor: '#FFC61A', borderColor: '#FFC61A' },
  optionText: { color: '#777', fontSize: 13, fontWeight: '500' },
  optionTextSelected: { color: '#000', fontWeight: '700' },
  changePassBtn: {
    marginTop: 12, alignItems: 'center', paddingVertical: 14,
  },
  changePassText: { color: '#555', fontSize: 14, fontWeight: '500' },
});

export default ConfigUserScreen;