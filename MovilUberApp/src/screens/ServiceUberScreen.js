import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StatusBar, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { getVehicleTypes } from '../storage/Firestore.Service';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../storage/Firebase.config';

const GOOGLE_API_KEY = 'AIzaSyBzRjy2oIcuHcH7Gu-wHTXn4u1vcaWpM6A';
const MEDELLIN = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.06, longitudeDelta: 0.06 };
const VEHICLE_ICONS = { economy: 'car-outline', xl: 'car-estate', premium: 'star-circle-outline' };

const ServiceUberScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const mapRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);

  const [originCoord, setOriginCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);
  const [originName, setOriginName] = useState('');
  const [destName, setDestName] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

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

  useEffect(() => {
    if (originCoord && destCoord) {
      mapRef.current?.fitToCoordinates([originCoord, destCoord], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [originCoord, destCoord]);

  const estimatedFare = () => {
    if (!selectedType) return 0;
    return selectedType.baseFare + 5 * selectedType.perKm;
  };

  const handleRequest = async () => {
    if (!originName || !destName) {
      Alert.alert('Faltan datos', 'Selecciona origen y destino.');
      return;
    }
    if (!selectedType) {
      Alert.alert('Vehículo requerido', 'Selecciona un tipo de vehículo.');
      return;
    }
    setLoading(true);
    try {
      const tripRef = await addDoc(collection(db, 'trips'), {
        passengerId: user.uid,
        vehicleTypeId: selectedType.id,
        originName,
        destName,
        origin: originCoord || null,
        destination: destCoord || null,
        fare: estimatedFare(),
        status: 'requested',
        paymentMethod: 'mercadopago',
        createdAt: Timestamp.now(),
      });
      navigation.navigate('Payment', {
        tripId: tripRef.id,
        fare: estimatedFare(),
        origin: originName,
        destination: destName,
        vehicleType: selectedType.name,
      });
      originRef.current?.clear();
      destRef.current?.clear();
      setOriginCoord(null);
      setDestCoord(null);
      setOriginName('');
      setDestName('');
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'No se pudo solicitar el viaje.');
    } finally {
      setLoading(false);
    }
  };

  const autocompleteQuery = {
    key: GOOGLE_API_KEY,
    language: 'es',
    components: 'country:co',
    location: '6.2442,-75.5812',
    radius: '50000',
  };

  const autocompleteStyles = {
    container: { flex: 1 },
    textInputContainer: { backgroundColor: 'transparent', paddingHorizontal: 0 },
    textInput: {
      backgroundColor: '#0F0F0F',
      color: '#FFF',
      fontSize: 14,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 44,
      borderWidth: 1,
      borderColor: '#2A2A2A',
      marginBottom: 0,
    },
    listView: {
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      marginTop: 2,
      borderWidth: 1,
      borderColor: '#2A2A2A',
      elevation: 10,
      zIndex: 9999,
    },
    row: { backgroundColor: '#1E1E1E', paddingVertical: 12, paddingHorizontal: 14 },
    separator: { height: 1, backgroundColor: '#2A2A2A' },
    description: { color: '#CCC', fontSize: 13 },
    poweredContainer: { backgroundColor: '#1E1E1E', borderTopWidth: 0 },
    powered: { display: 'none' },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar viaje</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Panel de búsqueda — FUERA del ScrollView para que el teclado funcione */}
      <View style={styles.searchPanel}>

        {/* Origen */}
        <View style={styles.searchRow}>
          <View style={styles.dotGreen} />
          <GooglePlacesAutocomplete
            ref={originRef}
            placeholder="¿Desde dónde sales?"
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
              setOriginName(data.description);
              if (details?.geometry?.location) {
                setOriginCoord({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }
            }}
            query={autocompleteQuery}
            styles={autocompleteStyles}
            enablePoweredByContainer={false}
            debounce={400}
            keepResultsAfterBlur={true}
            textInputProps={{
              placeholderTextColor: '#555',
              returnKeyType: 'search',
              clearButtonMode: 'while-editing',
            }}
          />
          {originName ? (
            <TouchableOpacity onPress={() => {
              originRef.current?.clear();
              setOriginName('');
              setOriginCoord(null);
            }}>
              <Icon name="close-circle" size={18} color="#555" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.searchDivider} />

        {/* Destino */}
        <View style={styles.searchRow}>
          <View style={styles.dotRed} />
          <GooglePlacesAutocomplete
            ref={destRef}
            placeholder="¿A dónde vas?"
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
              setDestName(data.description);
              if (details?.geometry?.location) {
                setDestCoord({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }
            }}
            query={autocompleteQuery}
            styles={autocompleteStyles}
            enablePoweredByContainer={false}
            debounce={400}
            keepResultsAfterBlur={true}
            textInputProps={{
              placeholderTextColor: '#555',
              returnKeyType: 'search',
              clearButtonMode: 'while-editing',
            }}
          />
          {destName ? (
            <TouchableOpacity onPress={() => {
              destRef.current?.clear();
              setDestName('');
              setDestCoord(null);
            }}>
              <Icon name="close-circle" size={18} color="#555" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={MEDELLIN}
          customMapStyle={darkMapStyle}
          showsUserLocation>
          {originCoord && (
            <Marker coordinate={originCoord} title="Origen">
              <Icon name="map-marker" size={36} color="#22C55E" />
            </Marker>
          )}
          {destCoord && (
            <Marker coordinate={destCoord} title="Destino">
              <Icon name="flag-variant" size={36} color="#EF4444" />
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

        <View style={styles.mapStatus}>
          <Icon
            name={!originCoord ? 'map-marker-plus-outline' : !destCoord ? 'flag-outline' : 'check-circle-outline'}
            size={14}
            color={!originCoord ? '#FFC61A' : !destCoord ? '#EF4444' : '#22C55E'}
          />
          <Text style={[styles.mapStatusText, {
            color: !originCoord ? '#FFC61A' : !destCoord ? '#EF4444' : '#22C55E',
          }]}>
            {!originCoord
              ? 'Escribe el origen arriba'
              : !destCoord
                ? 'Ahora escribe el destino'
                : '¡Ruta lista!'}
          </Text>
        </View>
      </View>

      {/* Panel de vehículos — dentro del ScrollView */}
      <ScrollView
        style={styles.panel}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always">

        <Text style={styles.sectionLabel}>Tipo de vehículo</Text>

        {loadingTypes ? (
          <ActivityIndicator color="#FFC61A" style={{ marginVertical: 16 }} />
        ) : vehicleTypes.map(vt => (
          <TouchableOpacity
            key={vt.id}
            style={[styles.vehicleCard, selectedType?.id === vt.id && styles.vehicleSelected]}
            onPress={() => setSelectedType(vt)}
            activeOpacity={0.8}>
            <View style={[
              styles.vehicleIconWrap,
              selectedType?.id === vt.id && { backgroundColor: '#00000020' },
            ]}>
              <Icon
                name={VEHICLE_ICONS[vt.id] || 'car-outline'}
                size={24}
                color={selectedType?.id === vt.id ? '#000' : '#FFC61A'}
              />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, selectedType?.id === vt.id && { color: '#000' }]}>
                {vt.name}
              </Text>
              <Text style={[styles.vehicleDesc, selectedType?.id === vt.id && { color: '#00000088' }]}>
                {vt.capacity} personas · ${(vt.baseFare + 5 * vt.perKm).toLocaleString()}
              </Text>
            </View>
            {selectedType?.id === vt.id && (
              <Icon name="check-circle" size={20} color="#000" />
            )}
          </TouchableOpacity>
        ))}

        {selectedType && (
          <View style={styles.fareCard}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Tarifa estimada</Text>
              <Text style={styles.fareValue}>${estimatedFare().toLocaleString()} COP</Text>
            </View>
            <Text style={styles.fareNote}>Estimado para ~5 km · puede variar</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.requestBtn,
            (loading || !originName || !destName) && styles.requestBtnDisabled,
          ]}
          onPress={handleRequest}
          disabled={loading || !originName || !destName}
          activeOpacity={0.9}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Icon name="car-arrow-right" size={22} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.requestBtnText}>
                {!originName || !destName ? 'Selecciona origen y destino' : 'Confirmar viaje'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1A1A2E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  searchPanel: {
    backgroundColor: '#161616', marginHorizontal: 16,
    borderRadius: 18, padding: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    zIndex: 9999, elevation: 9999,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    zIndex: 9999, elevation: 9999,
  },
  searchDivider: {
    height: 1, backgroundColor: '#2A2A2A',
    marginVertical: 8, marginLeft: 22,
  },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E' },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' },

  mapWrap: {
    height: 180, marginHorizontal: 16,
    borderRadius: 16, overflow: 'hidden', marginBottom: 10,
  },
  map: { flex: 1 },
  mapStatus: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#000000CC', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
  },
  mapStatusText: { fontSize: 12, fontWeight: '600' },

  panel: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: {
    color: '#555', fontSize: 12, fontWeight: '700',
    letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase',
  },

  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#161616', borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: '#1E1E1E',
  },
  vehicleSelected: { borderColor: '#FFC61A', backgroundColor: '#FFC61A' },
  vehicleIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFC61A15', justifyContent: 'center', alignItems: 'center',
  },
  vehicleInfo: { flex: 1 },
  vehicleName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  vehicleDesc: { color: '#666', fontSize: 12, marginTop: 2 },

  fareCard: {
    backgroundColor: '#161616', borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: '#FFC61A33',
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  fareValue: { color: '#FFC61A', fontWeight: '800', fontSize: 18 },
  fareNote: { color: '#555', fontSize: 11, marginTop: 4 },

  requestBtn: {
    backgroundColor: '#FFC61A', borderRadius: 14, height: 56,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  requestBtnDisabled: { opacity: 0.4 },
  requestBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

export default ServiceUberScreen;