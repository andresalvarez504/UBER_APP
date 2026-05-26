import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, Image, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/slices/userSlice';
import { updateUser } from '../storage/Firestore.Service';
import { signOut } from 'firebase/auth';
import { auth } from '../storage/Firebase.config';
import CustomButton from '../components/CustomButton';

const GENDERS = [
  { label: 'Masculino', icon: 'gender-male' },
  { label: 'Femenino', icon: 'gender-female' },
  { label: 'Otro', icon: 'gender-non-binary' },
];
const LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

const SettingRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingIcon}>
      <Icon name={icon} size={20} color="#FFC61A" />
    </View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
    </View>
    <Icon name="chevron-right" size={20} color="#333" />
  </TouchableOpacity>
);

const ConfigUserScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [editing, setEditing] = useState(false);
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
    if (!fullName || !phone || !gender) { Alert.alert('Error', 'Completa todos los campos.'); return; }
    if (fullName.length > 50) { Alert.alert('Error', 'Nombre máximo 50 caracteres.'); return; }
    if (!/^\d+$/.test(phone)) { Alert.alert('Error', 'El celular solo debe contener dígitos.'); return; }
    setLoading(true);
    try {
      if (user.docId) await updateUser(user.docId, { fullName, phone, gender, language, photoURL: photo || '' });
      dispatch(setUser({ fullName, phone, gender, language, photoURL: photo || '' }));
      setEditing(false);
      Alert.alert('¡Listo!', 'Perfil actualizado correctamente.');
    } catch { Alert.alert('Error', 'No se pudo actualizar el perfil.'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
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
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity
            style={[styles.editBtn, editing && styles.editBtnActive]}
            onPress={() => editing ? handleSave() : setEditing(true)}>
            <Icon name={editing ? 'check' : 'pencil-outline'} size={16} color={editing ? '#000' : '#FFF'} />
            <Text style={[styles.editBtnText, editing && { color: '#000' }]}>{editing ? 'Guardar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrap} onPress={editing ? pickImage : undefined} activeOpacity={editing ? 0.7 : 1}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{fullName.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
            {editing && (
              <View style={styles.cameraBadge}>
                <Icon name="camera" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarName}>{user.fullName}</Text>
          <Text style={styles.avatarEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Icon name="account-check" size={13} color="#FFC61A" />
            <Text style={styles.roleText}>Pasajero verificado</Text>
          </View>
        </View>

        {editing ? (
          /* Modo edición */
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Datos personales</Text>

            <Text style={styles.label}>Nombre completo</Text>
            <View style={styles.inputWrap}>
              <Icon name="account-outline" size={18} color="#555" style={{ marginRight: 10 }} />
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#444" maxLength={50} />
              <Text style={styles.charCount}>{fullName.length}/50</Text>
            </View>

            <Text style={styles.label}>Número de celular</Text>
            <View style={styles.inputWrap}>
              <Icon name="phone-outline" size={18} color="#555" style={{ marginRight: 10 }} />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholderTextColor="#444" keyboardType="numeric" />
            </View>

            <Text style={styles.label}>Género</Text>
            <View style={styles.optionRow}>
              {GENDERS.map(g => (
                <TouchableOpacity key={g.label} style={[styles.option, gender === g.label && styles.optionSelected]} onPress={() => setGender(g.label)}>
                  <Icon name={g.icon} size={16} color={gender === g.label ? '#000' : '#555'} />
                  <Text style={[styles.optionText, gender === g.label && styles.optionTextSelected]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Idioma</Text>
            <View style={styles.optionRow}>
              {LANGUAGES.map(l => (
                <TouchableOpacity key={l.value} style={[styles.option, language === l.value && styles.optionSelected]} onPress={() => setLanguage(l.value)}>
                  <Text style={[styles.optionText, language === l.value && styles.optionTextSelected]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomButton title="Guardar cambios" onPress={handleSave} loading={loading} icon="content-save-outline" />
            <CustomButton title="Cancelar" onPress={() => setEditing(false)} variant="outline" icon="close" />
          </View>
        ) : (
          /* Modo vista */
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Información</Text>
            <View style={styles.settingsCard}>
              <SettingRow icon="account-outline" label="Nombre" value={user.fullName} />
              <View style={styles.separator} />
              <SettingRow icon="phone-outline" label="Celular" value={user.phone} />
              <View style={styles.separator} />
              <SettingRow icon="email-outline" label="Correo" value={user.email} />
              <View style={styles.separator} />
              <SettingRow icon="human-non-binary" label="Género" value={user.gender} />
              <View style={styles.separator} />
              <SettingRow icon="translate" label="Idioma" value={user.language === 'es' ? 'Español' : 'English'} />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Cuenta</Text>
            <View style={styles.settingsCard}>
              <SettingRow icon="lock-outline" label="Cambiar contraseña" onPress={() => navigation.navigate('ChangePassword')} />
            </View>

            <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.8}>
              <Icon name="logout" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flexGrow: 1, padding: 20, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#161616', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A' },
  editBtnActive: { backgroundColor: '#FFC61A', borderColor: '#FFC61A' },
  editBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarImg: { width: 96, height: 96, borderRadius: 30, borderWidth: 3, borderColor: '#FFC61A' },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 30, backgroundColor: '#FFC61A', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 40, fontWeight: '800', color: '#000' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 10, backgroundColor: '#FFC61A', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0A0A0A' },
  avatarName: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  avatarEmail: { fontSize: 13, color: '#555', marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFC61A15', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  roleText: { color: '#FFC61A', fontSize: 12, fontWeight: '600' },
  editSection: { backgroundColor: '#161616', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E1E1E' },
  settingsSection: {},
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#555', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  settingsCard: { backgroundColor: '#161616', borderRadius: 20, borderWidth: 1, borderColor: '#1E1E1E', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFC61A15', justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { color: '#888', fontSize: 12 },
  settingValue: { color: '#FFF', fontSize: 14, fontWeight: '600', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#1A1A1A', marginLeft: 64 },
  label: { color: '#777', fontSize: 13, marginBottom: 6, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 14, height: 52 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  charCount: { color: '#444', fontSize: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#0A0A0A' },
  optionSelected: { backgroundColor: '#FFC61A', borderColor: '#FFC61A' },
  optionText: { color: '#666', fontSize: 13, fontWeight: '500' },
  optionTextSelected: { color: '#000', fontWeight: '700' },
  logoutCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EF444415', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#EF444433' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});

export default ConfigUserScreen;