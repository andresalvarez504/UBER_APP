import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../storage/Firebase.config';
import { getUserById } from '../storage/Firestore.Service';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';
import CustomButton from '../components/CustomButton';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserById(credential.user.uid);
      if (userData) dispatch(setUser(userData));
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🚗</Text>
          </View>
          <Text style={styles.logoName}>UberClone</Text>
          <Text style={styles.logoTagline}>Tu viaje, tu forma</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Iniciar sesión</Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passWrap}>
            <TextInput
              style={styles.passInput}
              placeholder="••••••••"
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <CustomButton title="Ingresar" onPress={handleLogin} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>o</Text>
            <View style={styles.divLine} />
          </View>

          <CustomButton
            title="¿No tienes cuenta? Regístrate"
            onPress={() => navigation.navigate('CreateUser')}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFC61A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 40 },
  logoName: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  logoTagline: { fontSize: 14, color: '#555', marginTop: 4 },
  form: {
    backgroundColor: '#161616', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#222',
  },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 24 },
  label: { color: '#777', fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#0A0A0A', color: '#FFF', borderRadius: 12,
    paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#2A2A2A', fontSize: 15,
  },
  passWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', height: 52 },
  passInput: { flex: 1, color: '#FFF', paddingHorizontal: 16, fontSize: 15 },
  eyeBtn: { paddingHorizontal: 14 },
  eyeText: { fontSize: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: '#222' },
  divText: { color: '#444', fontSize: 13 },
});

export default LoginScreen;