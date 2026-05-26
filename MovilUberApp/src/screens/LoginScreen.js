import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Campos vacíos', 'Por favor completa todos los campos.'); return; }
    if (!validateEmail(email)) { Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.'); return; }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserById(credential.user.uid);
      if (userData) dispatch(setUser(userData));
      navigation.replace('Main');
    } catch {
      Alert.alert('Error', 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Icon name="car-sports" size={40} color="#000" />
          </View>
          <Text style={styles.logoName}>UberClone</Text>
          <Text style={styles.logoTagline}>Tu viaje, tu forma</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bienvenido de nuevo</Text>
          <Text style={styles.cardSub}>Inicia sesión para continuar</Text>

          {/* Email */}
          <View style={[styles.inputWrap, emailFocus && styles.inputFocused]}>
            <Icon name="email-outline" size={20} color={emailFocus ? '#FFC61A' : '#555'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#444"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, passFocus && styles.inputFocused]}>
            <Icon name="lock-outline" size={20} color={passFocus ? '#FFC61A' : '#555'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <CustomButton title="Iniciar sesión" onPress={handleLogin} loading={loading} icon="login" />

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>¿No tienes cuenta?</Text>
            <View style={styles.divLine} />
          </View>

          <CustomButton
            title="Crear cuenta"
            onPress={() => navigation.navigate('CreateUser')}
            variant="outline"
            icon="account-plus-outline"
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Al continuar aceptas nuestros términos y condiciones</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 84, height: 84, borderRadius: 28, backgroundColor: '#FFC61A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#FFC61A', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  logoName: { fontSize: 30, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  logoTagline: { fontSize: 14, color: '#555', marginTop: 4 },
  card: { backgroundColor: '#161616', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E1E1E' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#555', marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F0F',
    borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', height: 54, marginBottom: 12,
  },
  inputFocused: { borderColor: '#FFC61A' },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  eyeBtn: { paddingHorizontal: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: '#1E1E1E' },
  divText: { color: '#444', fontSize: 12 },
  footer: { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 24 },
});

export default LoginScreen;