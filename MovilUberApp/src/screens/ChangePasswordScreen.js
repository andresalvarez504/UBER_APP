import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../storage/Firebase.config';
import CustomButton from '../components/CustomButton';

const ChangePasswordScreen = ({ navigation }) => {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!current || !newPass || !confirm) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    if (newPass.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPass !== confirm) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      Alert.alert('¡Listo!', 'Contraseña actualizada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'La contraseña actual es incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cambiar contraseña</Text>

        <Text style={styles.label}>Contraseña actual</Text>
        <TextInput
          style={styles.input} placeholder="••••••••" placeholderTextColor="#666"
          value={current} onChangeText={setCurrent} secureTextEntry
        />

        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput
          style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#666"
          value={newPass} onChangeText={setNewPass} secureTextEntry
        />

        <Text style={styles.label}>Confirmar nueva contraseña</Text>
        <TextInput
          style={styles.input} placeholder="Repite la nueva contraseña" placeholderTextColor="#666"
          value={confirm} onChangeText={setConfirm} secureTextEntry
        />

        <CustomButton title="Actualizar contraseña" onPress={handleChange} loading={loading} />
        <CustomButton title="Cancelar" onPress={() => navigation.goBack()} variant="outline" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 32 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 4, marginTop: 14 },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10,
    paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#333',
  },
});

export default ChangePasswordScreen;