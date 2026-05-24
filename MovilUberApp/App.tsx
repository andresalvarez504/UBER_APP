import React, { useEffect, useState } from 'react'; // <-- Corregido useState aquí
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Importamos tu configuración

export default function App() {
  const [conexionEstado, setConexionEstado] = useState<'probando' | 'exito' | 'error'>('probando');
  const [detallesError, setDetallesError] = useState('');

  useEffect(() => {
    const enviarDatoPrueba = async () => {
      try {
        // Intentamos registrar un documento en la colección de Firebase
        await addDoc(collection(db, "usuarios_prueba"), {
          nombre: "Andres",
          rol: "Pasajero",
          creadoEn: new Date().toISOString(),
          estadoPrueba: "Firebase funcionando OK"
        });

        setConexionEstado('exito');
      } catch (error: any) {
        console.error("Error completo de Firebase: ", error);
        setDetallesError(error.message || 'Error desconocido');
        setConexionEstado('error');
      }
    };

    enviarDatoPrueba();
  }, []);

  return (
    <View style={styles.screen}>
      {conexionEstado === 'probando' && (
        <>
          <ActivityIndicator size="large" color="#FFC61A" />
          <Text style={styles.text}>Conectando con la base de datos de Uber...</Text>
        </>
      )}

      {conexionEstado === 'exito' && (
        <View style={styles.card}>
          <Text style={styles.successTitle}>¡CONEXIÓN EXITOSA! 🎉</Text>
          <Text style={styles.text}>El documento de prueba se registró en tu consola de Firebase Firestore.</Text>
        </View>
      )}

      {conexionEstado === 'error' && (
        <View style={styles.card}>
          <Text style={styles.errorTitle}>❌ FALLÓ LA CONEXIÓN</Text>
          <Text style={styles.errorText}>{detallesError}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000', // Fondo negro estilo Uber
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  successTitle: {
    color: '#4CD964',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorTitle: {
    color: '#FF3B30',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#aaaaaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  }
});