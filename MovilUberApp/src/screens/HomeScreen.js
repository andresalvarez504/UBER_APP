import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { getTripHistory } from '../storage/Firestore.Service';

const statusConfig = {
  completed:   { color: '#22C55E', label: 'Completado',  icon: 'check-circle-outline' },
  in_progress: { color: '#FFC61A', label: 'En curso',    icon: 'clock-outline' },
  requested:   { color: '#60A5FA', label: 'Solicitado',  icon: 'map-marker-outline' },
};

const vehicleIcon = { Económico: 'car-outline', XL: 'car-estate', Premium: 'star-outline' };

const HomeScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Usa user.uid (no user.docId)
  const fetchHistory = useCallback(async () => {
    if (user.uid) {
      try {
        const data = await getTripHistory(user.uid);
        setHistory(data);
      } catch (e) { console.log('fetchHistory error:', e); }
    }
    setLoading(false);
    setRefreshing(false);
  }, [user.uid]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Refresca al volver a la pantalla
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchHistory);
    return unsub;
  }, [navigation, fetchHistory]);

  const onRefresh = () => { setRefreshing(true); fetchHistory(); };

  const totalSpent = history.reduce((sum, t) => sum + (t.fare || 0), 0);
  const completed = history.filter(t => t.status === 'completed').length;

  const renderTrip = ({ item }) => {
    const cfg = statusConfig[item.status] || statusConfig.requested;
    const vIcon = vehicleIcon[item.vehicleType] || 'car-outline';
    return (
      <View style={styles.tripCard}>
        <View style={styles.tripTop}>
          <View style={styles.tripIconWrap}>
            <Icon name={vIcon} size={22} color="#FFC61A" />
          </View>
          <View style={styles.tripMeta}>
            <Text style={styles.vehicleType}>{item.vehicleType || 'Económico'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.color + '22' }]}>
              <Icon name={cfg.icon} size={11} color={cfg.color} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <View style={styles.tripFareWrap}>
            <Text style={styles.tripFare}>${item.fare?.toLocaleString()}</Text>
            <Text style={styles.tripCurrency}>COP</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.tripRoute}>
          <View style={styles.routeColumn}>
            <View style={styles.routeDot}><View style={styles.dotInnerGreen} /></View>
            <View style={styles.routeLine} />
            <View style={styles.routeDot}><View style={styles.dotInnerRed} /></View>
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeOrigin} numberOfLines={1}>{item.origin}</Text>
            <Text style={styles.routeDest} numberOfLines={1}>{item.destination}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user.fullName?.split(' ')[0] || 'Pasajero'} 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Config')}>
          <Text style={styles.avatarText}>{user.fullName?.charAt(0).toUpperCase() || '?'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Icon name="map-marker-path" size={22} color="#FFC61A" />
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Viajes</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="check-decagram-outline" size={22} color="#22C55E" />
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="cash-multiple" size={22} color="#60A5FA" />
          <Text style={styles.statValue}>${(totalSpent / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Gastado</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.requestCard} onPress={() => navigation.navigate('Service')} activeOpacity={0.9}>
        <View style={styles.requestLeft}>
          <Text style={styles.requestTitle}>¿A dónde vamos?</Text>
          <Text style={styles.requestSub}>Toca para solicitar tu viaje</Text>
        </View>
        <View style={styles.requestIconWrap}>
          <Icon name="arrow-right" size={22} color="#000" />
        </View>
      </TouchableOpacity>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Historial</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{history.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFC61A" style={{ marginTop: 32 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="map-search-outline" size={56} color="#222" />
          <Text style={styles.emptyTitle}>Sin viajes aún</Text>
          <Text style={styles.emptyText}>Solicita tu primer viaje y aparecerá aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderTrip}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFC61A" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  date: { fontSize: 13, color: '#555', marginTop: 2, textTransform: 'capitalize' },
  avatarBtn: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#FFC61A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#000' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#161616', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1E1E1E' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#555', marginTop: 2 },
  requestCard: { backgroundColor: '#FFC61A', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  requestLeft: { flex: 1 },
  requestTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  requestSub: { fontSize: 13, color: '#00000077', marginTop: 2 },
  requestIconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#00000015', justifyContent: 'center', alignItems: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  countBadge: { backgroundColor: '#FFC61A22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  countText: { color: '#FFC61A', fontWeight: '700', fontSize: 12 },
  tripCard: { backgroundColor: '#161616', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E1E1E' },
  tripTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tripIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFC61A15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tripMeta: { flex: 1 },
  vehicleType: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '600' },
  tripFareWrap: { alignItems: 'flex-end' },
  tripFare: { color: '#FFC61A', fontWeight: '800', fontSize: 17 },
  tripCurrency: { color: '#555', fontSize: 10, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1E1E1E', marginBottom: 12 },
  tripRoute: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  routeColumn: { alignItems: 'center', width: 16 },
  routeDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  dotInnerGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  dotInnerRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  routeLine: { width: 1, height: 20, backgroundColor: '#2A2A2A', marginVertical: 2 },
  routeLabels: { flex: 1, gap: 12 },
  routeOrigin: { color: '#CCC', fontSize: 13, fontWeight: '500' },
  routeDest: { color: '#777', fontSize: 13 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyTitle: { color: '#333', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyText: { color: '#333', fontSize: 14, textAlign: 'center', marginTop: 6 },
});

export default HomeScreen;