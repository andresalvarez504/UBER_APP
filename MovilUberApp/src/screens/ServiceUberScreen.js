import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { getVehicleTypes } from '../storage/Firestore.Service';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../storage/Firebase.config';
import CustomButton from '../components/CustomButton';

const MEDELLIN = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.05, longitudeDelta: 0.05 };

const ServiceUberScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [originCoord, setOriginCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getVehicleTypes();
        setVehicleTypes(types);
        if (types.length > 0) setSelectedType(types[0]);
      } catch (e) { console.log(e); }
      setLoadingTypes(false);
    };
    fetchTypes();
  }, []);

  const estimatedFare = () => {
    if (!selectedType) return 0;
    return selectedType.baseFare + 5 * selectedType.perKm;
  };

  const handleMapPress = (e) => {
    const coord = e.nativeEvent.coordinate;
    if (!originCoord) {
      setOriginCoord(coord);
      setOrigin(`${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`);
    } else if (!destCoord) {
      setDestCoord(coord);
      setDestination(`${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`);
    }
  };

  const resetMap = () => {
    setOriginCoord(null);
    setDestCoord(null);
    setOrigin('');
    setDestination('');
  };

  const handleRequest = async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Toca el mapa para marcar origen y destino.');
      return;
    }
    if (!selectedType) {
      Alert.alert('Error', 'Selecciona un tipo de vehículo.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'trips'), {
        passengerId: user.uid,
        vehicleTypeId: selectedType.id,
        originName: origin,
        destName: destination,
        origin: originCoord ? { latitude: originCoord.latitude, longitude: originCoord.longitude } : null,
        destination: destCoord ? { latitude: destCoord.latitude, longitude: destCoord.longitude } : null,
        fare: estimatedFare(),
        status: 'requested',
        paymentMethod: 'stripe',
        createdAt: Timestamp.now(),
      });
      Alert.alert('¡Viaje solicitado!', 'Tu conductor está en camino.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'No se pudo solicitar el viaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Mapa */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={MEDELLIN}
          onPress={handleMapPress}
        >
          {originCoord && (
            <Marker coordinate={originCoord} title="Origen" pinColor="#22C55E" />
          )}
          {destCoord && (
            <Marker coordinate={destCoord} title="Destino" pinColor="#EF4444" />
          )}
        </MapView>

        {/* Botón reset */}
        {(originCoord || destCoord) && (
          <TouchableOpacity style={styles.resetBtn} onPress={resetMap}>
            <Text style={styles.resetText}>✕ Limpiar</Text>
          </TouchableOpacity>
        )}

        {/* Hint */}
        <View style={styles.mapHint}>
          <Text style={styles.mapHintText}>
            {!originCoord ? '📍 Toca para marcar origen' : !destCoord ? '🎯 Toca para marcar destino' : '✅ Ruta lista'}
          </Text>
        </View>
      </View>

      {/* Panel inferior */}
      <ScrollView style={styles.panel} showsVerticalScrollIndicator={false}>

        <Text style={styles.panelTitle}>Detalles del viaje</Text>

        {/* Origen y destino */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.dotGreen} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {origin || 'Origen — toca el mapa'}
            </Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <View style={styles.dotRed} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {destination || 'Destino — toca el mapa'}
            </Text>
          </View>
        </View>

        {/* Tipos de vehículo */}
        <Text style={styles.sectionLabel}>Tipo de vehículo</Text>
        {loadingTypes ? (
          <ActivityIndicator color="#FFC61A" />
        ) : (
          vehicleTypes.map(vt => (
            <TouchableOpacity
              key={vt.id}
              style={[styles.vehicleCard, selectedType?.id === vt.id && styles.vehicleCardSelected]}
              onPress={() => setSelectedType(vt)}
              activeOpacity={0.8}>
              <View style={styles.vehicleLeft}>
                <Text style={styles.vehicleEmoji}>
                  {vt.id === 'economy' ? '🚗' : vt.id === 'xl' ? '🚙' : '⭐'}
                </Text>
                <View>
                  <Text style={styles.vehicleName}>{vt.name}</Text>
                  <Text style={styles.vehicleDesc}>{vt.capacity} personas · {vt.description}</Text>
                </View>
              </View>
              <Text style={styles.vehicleFare}>${(vt.baseFare + 5 * vt.perKm).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Tarifa */}
        {selectedType && (
          <View style={styles.fareBox}>
            <View>
              <Text style={styles.fareLabel}>Tarifa estimada</Text>
              <Text style={styles.fareNote}>Basado en ~5 km</Text>
            </View>
            <Text style={styles.fareValue}>${estimatedFare().toLocaleString()} COP</Text>
          </View>
        )}

        <CustomButton title="Solicitar viaje" onPress={handleRequest} loading={loading} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  mapWrap: { height: 280, position: 'relative' },
  map: { flex: 1 },
  resetBtn: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#000000CC', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#333',
  },
  resetText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  mapHint: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    backgroundColor: '#000000CC', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignItems: 'center',
  },
  mapHintText: { color: '#FFF', fontSize: 13, fontWeight: '500' },
  panel: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 20, paddingTop: 20 },
  panelTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  routeCard: {
    backgroundColor: '#161616', borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#222',
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  routeLabel: { color: '#CCC', fontSize: 14, flex: 1 },
  routeDivider: { height: 1, backgroundColor: '#222', marginVertical: 10, marginLeft: 22 },
  sectionLabel: { color: '#777', fontSize: 13, fontWeight: '600', marginBottom: 10, letterSpacing: 0.5 },
  vehicleCard: {
    backgroundColor: '#161616', borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, borderWidth: 1.5, borderColor: '#222',
  },
  vehicleCardSelected: { borderColor: '#FFC61A', backgroundColor: '#FFC61A11' },
  vehicleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleEmoji: { fontSize: 28 },
  vehicleName: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  vehicleDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  vehicleFare: { color: '#FFC61A', fontWeight: '800', fontSize: 15 },
  fareBox: {
    backgroundColor: '#161616', borderRadius: 14, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginVertical: 16, borderWidth: 1, borderColor: '#FFC61A44',
  },
  fareLabel: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  fareNote: { color: '#555', fontSize: 12, marginTop: 2 },
  fareValue: { color: '#FFC61A', fontSize: 22, fontWeight: '800' },
});

export default ServiceUberScreen;