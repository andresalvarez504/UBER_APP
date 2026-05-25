import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../storage/Firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import CustomButton from '../components/CustomButton';

const GENDERS = ['Masculino', 'Femenino', 'Prefiero no decir'];
const LANGUAGES = [{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }];

const CreateUserScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('es');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleRegister = async () => {
    if (!fullName || !phone || !gender || !email || !password) {
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
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, 'users'), {
        uid: credential.user.uid,
        fullName,
        phone,
        gender,
        email,
        language,
        photoURL: '',
        role: 'passenger',
        createdAt: Timestamp.now(),
      });
      Alert.alert('¡Listo!', 'Cuenta creada exitosamente.', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>

        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput
          style={styles.input} placeholder="Máximo 50 caracteres"
          placeholderTextColor="#666" value={fullName}
          onChangeText={setFullName} maxLength={50}
        />

        <Text style={styles.label}>Número de celular *</Text>
        <TextInput
          style={styles.input} placeholder="Ej: 3001234567"
          placeholderTextColor="#666" value={phone}
          onChangeText={setPhone} keyboardType="numeric"
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

        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput
          style={styles.input} placeholder="correo@ejemplo.com"
          placeholderTextColor="#666" value={email}
          onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        />

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

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={styles.input} placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#666" value={password}
          onChangeText={setPassword} secureTextEntry
        />

        <CustomButton title="Crear cuenta" onPress={handleRegister} loading={loading} />
        <CustomButton
          title="Ya tengo cuenta"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 24 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 4, marginTop: 14 },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10,
    paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#333',
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  option: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#444',
  },
  optionSelected: { backgroundColor: '#FFC61A', borderColor: '#FFC61A' },
  optionText: { color: '#aaa', fontSize: 13 },
  optionTextSelected: { color: '#000', fontWeight: '700' },
});

export default CreateUserScreen;