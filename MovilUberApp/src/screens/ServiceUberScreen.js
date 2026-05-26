import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { getVehicleTypes } from '../storage/Firestore.Service';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../storage/Firebase.config';
import CustomButton from '../components/CustomButton';

const MEDELLIN = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.06, longitudeDelta: 0.06 };

const vehicleEmoji = { economy: 'car-outline', xl: 'car-estate', premium: 'star-circle-outline' };

const ServiceUberScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [originCoord, setOriginCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);
  const [mapStep, setMapStep] = useState('origin'); // 'origin' | 'dest' | 'done'

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
    if (mapStep === 'origin') {
      setOriginCoord(coord);
      setMapStep('dest');
    } else if (mapStep === 'dest') {
      setDestCoord(coord);
      setMapStep('done');
      mapRef.current?.fitToCoordinates([originCoord, coord], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true,
      });
    }
  };

  const resetMap = () => {
    setOriginCoord(null);
    setDestCoord(null);
    setMapStep('origin');
  };

  const handleRequest = async () => {
    if (!originCoord || !destCoord) {
      Alert.alert('Faltan puntos', 'Marca origen y destino en el mapa.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'trips'), {
        passengerId: user.uid,
        vehicleTypeId: selectedType?.id || 'economy',
        originName: `${originCoord.latitude.toFixed(4)}, ${originCoord.longitude.toFixed(4)}`,
        destName: `${destCoord.latitude.toFixed(4)}, ${destCoord.longitude.toFixed(4)}`,
        origin: originCoord,
        destination: destCoord,
        fare: estimatedFare(),
        status: 'requested',
        paymentMethod: 'stripe',
        createdAt: Timestamp.now(),
      });
      Alert.alert('¡Viaje solicitado!', 'Un conductor está en camino hacia ti.', [
        { text: '¡Genial!', onPress: () => navigation.navigate('Home') },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo solicitar el viaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const stepHint = {
    origin: { icon: 'map-marker-plus-outline', text: 'Toca el mapa para marcar el origen', color: '#22C55E' },
    dest:   { icon: 'flag-outline',            text: 'Toca para marcar el destino',         color: '#EF4444' },
    done:   { icon: 'check-circle-outline',    text: 'Ruta lista — elige tu vehículo',      color: '#FFC61A' },
  }[mapStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Mapa */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={MEDELLIN}
          onPress={handleMapPress}
          customMapStyle={darkMapStyle}
        >
          {originCoord && (
            <Marker coordinate={originCoord} title="Origen">
              <View style={styles.markerOrigin}>
                <Icon name="map-marker" size={28} color="#22C55E" />
              </View>
            </Marker>
          )}
          {destCoord && (
            <Marker coordinate={destCoord} title="Destino">
              <View style={styles.markerDest}>
                <Icon name="flag-variant" size={28} color="#EF4444" />
              </View>
            </Marker>
          )}
          {originCoord && destCoord && (
            <Polyline
              coordinates={[originCoord, destCoord]}
              strokeColor="#FFC61A"
              strokeWidth={3}
              lineDashPattern={[8, 4]}
            />
          )}
        </MapView>

        {/* Hint */}
        <Animated.View style={[styles.hintBadge, { transform: [{ scale: mapStep === 'done' ? pulseAnim : 1 }] }]}>
          <Icon name={stepHint.icon} size={16} color={stepHint.color} />
          <Text style={[styles.hintText, { color: stepHint.color }]}>{stepHint.text}</Text>
        </Animated.View>

        {/* Reset */}
        {mapStep !== 'origin' && (
          <TouchableOpacity style={styles.resetBtn} onPress={resetMap}>
            <Icon name="restart" size={16} color="#FFF" />
            <Text style={styles.resetText}>Reiniciar</Text>
          </TouchableOpacity>
        )}

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Panel */}
      <ScrollView style={styles.panel} showsVerticalScrollIndicator={false}>
        <View style={styles.panelHandle} />

        <Text style={styles.panelTitle}>Confirma tu viaje</Text>

        {/* Ruta */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <Icon name="circle-slice-8" size={14} color="#22C55E" />
            <Text style={styles.routeText} numberOfLines={1}>
              {originCoord ? `${originCoord.latitude.toFixed(4)}, ${originCoord.longitude.toFixed(4)}` : 'Toca el mapa para marcar el origen'}
            </Text>
          </View>
          <View style={styles.routeLineV} />
          <View style={styles.routeRow}>
            <Icon name="flag-variant" size={14} color="#EF4444" />
            <Text style={styles.routeText} numberOfLines={1}>
              {destCoord ? `${destCoord.latitude.toFixed(4)}, ${destCoord.longitude.toFixed(4)}` : 'Toca el mapa para marcar el destino'}
            </Text>
          </View>
        </View>

        {/* Vehículos */}
        <Text style={styles.sectionLabel}>Elige tu vehículo</Text>
        {loadingTypes ? (
          <ActivityIndicator color="#FFC61A" style={{ marginVertical: 16 }} />
        ) : vehicleTypes.map(vt => (
          <TouchableOpacity
            key={vt.id}
            style={[styles.vehicleCard, selectedType?.id === vt.id && styles.vehicleSelected]}
            onPress={() => setSelectedType(vt)}
            activeOpacity={0.8}>
            <View style={styles.vehicleIconWrap}>
              <Icon name={vehicleEmoji[vt.id] || 'car-outline'} size={26} color={selectedType?.id === vt.id ? '#000' : '#FFC61A'} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, selectedType?.id === vt.id && styles.vehicleNameSelected]}>{vt.name}</Text>
              <Text style={styles.vehicleDesc}>
                <Icon name="account-group-outline" size={12} color="#666" /> {vt.capacity} · {vt.description}
              </Text>
            </View>
            <View style={styles.vehiclePriceWrap}>
              <Text style={[styles.vehiclePrice, selectedType?.id === vt.id && styles.vehiclePriceSelected]}>
                ${(vt.baseFare + 5 * vt.perKm).toLocaleString()}
              </Text>
              {selectedType?.id === vt.id && (
                <Icon name="check-circle" size={16} color="#000" style={{ marginTop: 4 }} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Tarifa */}
        {selectedType && (
          <View style={styles.fareCard}>
            <View style={styles.fareRow}>
              <Icon name="cash-multiple" size={20} color="#FFC61A" />
              <Text style={styles.fareLabel}>Tarifa estimada</Text>
            </View>
            <Text style={styles.fareValue}>${estimatedFare().toLocaleString()} COP</Text>
            <Text style={styles.fareNote}>
              <Icon name="information-outline" size={12} color="#555" /> Estimado para ~5 km · puede variar
            </Text>
          </View>
        )}

        <CustomButton
          title={mapStep === 'done' ? 'Confirmar viaje' : 'Marca origen y destino'}
          onPress={handleRequest}
          loading={loading}
          disabled={mapStep !== 'done'}
          icon="car-arrow-right"
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1A1A2E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  mapWrap: { height: '45%', position: 'relative' },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#000000CC',
    justifyContent: 'center', alignItems: 'center',
  },
  hintBadge: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000000DD', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1, borderColor: '#2A2A2A',
  },
  hintText: { fontSize: 13, fontWeight: '600', flex: 1 },
  resetBtn: {
    position: 'absolute', top: 48, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#000000CC', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#333',
  },
  resetText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  markerOrigin: { alignItems: 'center' },
  markerDest: { alignItems: 'center' },
  panel: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 20 },
  panelHandle: { width: 40, height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  panelTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  routeCard: { backgroundColor: '#161616', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1E1E1E' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeText: { color: '#AAA', fontSize: 13, flex: 1 },
  routeLineV: { width: 1, height: 16, backgroundColor: '#2A2A2A', marginLeft: 7, marginVertical: 4 },
  sectionLabel: { color: '#555', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#161616', borderRadius: 16, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: '#1E1E1E',
  },
  vehicleSelected: { borderColor: '#FFC61A', backgroundColor: '#FFC61A' },
  vehicleIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFC61A15', justifyContent: 'center', alignItems: 'center' },
  vehicleInfo: { flex: 1 },
  vehicleName: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  vehicleNameSelected: { color: '#000' },
  vehicleDesc: { color: '#666', fontSize: 12, marginTop: 3 },
  vehiclePriceWrap: { alignItems: 'flex-end' },
  vehiclePrice: { color: '#FFC61A', fontWeight: '800', fontSize: 15 },
  vehiclePriceSelected: { color: '#000' },
  fareCard: {
    backgroundColor: '#161616', borderRadius: 16, padding: 16,
    marginVertical: 16, borderWidth: 1, borderColor: '#FFC61A33',
  },
  fareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fareLabel: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  fareValue: { color: '#FFC61A', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  fareNote: { color: '#555', fontSize: 12 },
});

export default ServiceUberScreen;