import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../storage/Firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import CustomButton from '../components/CustomButton';

const GENDERS = [
  { label: 'Masculino', icon: 'gender-male' },
  { label: 'Femenino', icon: 'gender-female' },
  { label: 'Otro', icon: 'gender-non-binary' },
];
const LANGUAGES = [
  { label: 'Español', value: 'es', icon: 'translate' },
  { label: 'English', value: 'en', icon: 'translate' },
];

const Field = ({ label, icon, children }) => (
  <View style={styles.fieldWrap}>
    <View style={styles.fieldLabel}>
      <Icon name={icon} size={15} color="#FFC61A" style={{ marginRight: 6 }} />
      <Text style={styles.label}>{label}</Text>
    </View>
    {children}
  </View>
);

const CreateUserScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('es');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleNext = () => {
    if (!fullName || !phone || !gender) {
      Alert.alert('Campos incompletos', 'Completa nombre, celular y género.');
      return;
    }
    if (fullName.length > 50) { Alert.alert('Error', 'El nombre no puede superar 50 caracteres.'); return; }
    if (!/^\d{10}$/.test(phone)) { Alert.alert('Error', 'El celular debe tener 10 dígitos.'); return; }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPass) { Alert.alert('Campos incompletos', 'Completa todos los campos.'); return; }
    if (!validateEmail(email)) { Alert.alert('Error', 'Correo no válido.'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres en la contraseña.'); return; }
    if (password !== confirmPass) { Alert.alert('Error', 'Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, 'users'), {
        uid: credential.user.uid, fullName, phone, gender, email,
        language, photoURL: '', role: 'passenger', createdAt: Timestamp.now(),
      });
      Alert.alert('¡Cuenta creada!', `Bienvenido, ${fullName.split(' ')[0]}`, [
        { text: 'Empezar', onPress: () => navigation.replace('Main') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Crear cuenta</Text>
          <Text style={styles.headerSub}>Paso {step} de 2</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <View style={[styles.progressBar, { width: step === 1 ? '50%' : '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {step === 1 ? (
          <>
            <Text style={styles.stepTitle}>Datos personales</Text>

            <Field label="Nombre completo *" icon="account-outline">
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input} placeholder="Máximo 50 caracteres"
                  placeholderTextColor="#444" value={fullName}
                  onChangeText={setFullName} maxLength={50}
                />
                <Text style={styles.charCount}>{fullName.length}/50</Text>
              </View>
            </Field>

            <Field label="Número de celular *" icon="phone-outline">
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input} placeholder="10 dígitos"
                  placeholderTextColor="#444" value={phone}
                  onChangeText={setPhone} keyboardType="numeric" maxLength={10}
                />
              </View>
            </Field>

            <Field label="Género *" icon="human-non-binary">
              <View style={styles.optionRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g.label}
                    style={[styles.option, gender === g.label && styles.optionSelected]}
                    onPress={() => setGender(g.label)}>
                    <Icon name={g.icon} size={18} color={gender === g.label ? '#000' : '#555'} />
                    <Text style={[styles.optionText, gender === g.label && styles.optionTextSelected]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="Idioma preferido" icon="translate">
              <View style={styles.optionRow}>
                {LANGUAGES.map(l => (
                  <TouchableOpacity
                    key={l.value}
                    style={[styles.option, language === l.value && styles.optionSelected]}
                    onPress={() => setLanguage(l.value)}>
                    <Icon name={l.icon} size={16} color={language === l.value ? '#000' : '#555'} />
                    <Text style={[styles.optionText, language === l.value && styles.optionTextSelected]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <CustomButton title="Continuar" onPress={handleNext} icon="arrow-right" />
          </>
        ) : (
          <>
            <Text style={styles.stepTitle}>Credenciales</Text>

            <Field label="Correo electrónico *" icon="email-outline">
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input} placeholder="correo@ejemplo.com"
                  placeholderTextColor="#444" value={email}
                  onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                />
              </View>
            </Field>

            <Field label="Contraseña *" icon="lock-outline">
              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.input, { flex: 1 }]} placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#444" value={password}
                  onChangeText={setPassword} secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ paddingRight: 14 }}>
                  <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
                </TouchableOpacity>
              </View>
            </Field>

            <Field label="Confirmar contraseña *" icon="lock-check-outline">
              <View style={[styles.inputWrap, confirmPass && password !== confirmPass && styles.inputError]}>
                <TextInput
                  style={styles.input} placeholder="Repite tu contraseña"
                  placeholderTextColor="#444" value={confirmPass}
                  onChangeText={setConfirmPass} secureTextEntry={!showPass}
                />
                {confirmPass.length > 0 && (
                  <Icon
                    name={password === confirmPass ? 'check-circle-outline' : 'close-circle-outline'}
                    size={20}
                    color={password === confirmPass ? '#22C55E' : '#EF4444'}
                    style={{ paddingRight: 14 }}
                  />
                )}
              </View>
            </Field>

            {/* Resumen */}
            <View style={styles.summaryCard}>
              <Icon name="account-check-outline" size={18} color="#FFC61A" style={{ marginBottom: 8 }} />
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryText}>👤 {fullName}</Text>
              <Text style={styles.summaryText}>📱 {phone}</Text>
              <Text style={styles.summaryText}>⚧ {gender} · 🌐 {language === 'es' ? 'Español' : 'English'}</Text>
            </View>

            <CustomButton title="Crear cuenta" onPress={handleRegister} loading={loading} icon="account-plus" />
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 12, color: '#555', marginTop: 2 },
  progressWrap: { height: 3, backgroundColor: '#1A1A1A', marginHorizontal: 20, borderRadius: 2, marginBottom: 8 },
  progressBar: { height: 3, backgroundColor: '#FFC61A', borderRadius: 2 },
  inner: { flexGrow: 1, padding: 20, paddingTop: 12 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { color: '#888', fontSize: 13, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616',
    borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', minHeight: 52, paddingHorizontal: 16,
  },
  inputError: { borderColor: '#EF4444' },
  input: { flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 14 },
  charCount: { color: '#444', fontSize: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#161616',
  },
  optionSelected: { backgroundColor: '#FFC61A', borderColor: '#FFC61A' },
  optionText: { color: '#666', fontSize: 13, fontWeight: '500' },
  optionTextSelected: { color: '#000', fontWeight: '700' },
  summaryCard: {
    backgroundColor: '#161616', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#FFC61A33',
  },
  summaryTitle: { color: '#FFC61A', fontWeight: '700', fontSize: 14, marginBottom: 8 },
  summaryText: { color: '#888', fontSize: 13, marginTop: 4 },
});

export default CreateUserScreen;