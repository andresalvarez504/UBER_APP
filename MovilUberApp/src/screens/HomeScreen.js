import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getTripHistory } from '../storage/Firestore.Service';

const HomeScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user.docId) {
        try {
          const data = await getTripHistory(user.docId);
          setHistory(data);
        } catch (e) {
          console.log(e);
        }
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user.docId]);

  const statusColor = (status) => {
    if (status === 'completed') return '#22C55E';
    if (status === 'in_progress') return '#FFC61A';
    return '#888';
  };

  const statusLabel = (status) => {
    if (status === 'completed') return 'Completado';
    if (status === 'in_progress') return 'En curso';
    return 'Solicitado';
  };

  const renderTrip = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View style={styles.tripIconWrap}>
          <Text style={styles.tripIconText}>🚗</Text>
        </View>
        <View style={styles.tripMeta}>
          <Text style={styles.vehicleType}>{item.vehicleType || 'Económico'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.tripFare}>${item.fare?.toLocaleString()}</Text>
      </View>
      <View style={styles.tripRoute}>
        <View style={styles.routeLine}>
          <View style={styles.dotGreen} />
          <View style={styles.routeDash} />
          <View style={styles.dotRed} />
        </View>
        <View style={styles.routeLabels}>
          <Text style={styles.routeText} numberOfLines={1}>{item.origin}</Text>
          <Text style={styles.routeText} numberOfLines={1}>{item.destination}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hola, {user.fullName?.split(' ')[0] || 'Pasajero'} 👋</Text>
          <Text style={styles.subtitle}>¿A dónde vas hoy?</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Config')}>
          <Text style={styles.avatarText}>
            {user.fullName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Solicitar viaje */}
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate('Service')}
        activeOpacity={0.9}>
        <View style={styles.requestContent}>
          <View>
            <Text style={styles.requestTitle}>Solicitar viaje</Text>
            <Text style={styles.requestSub}>Elige tu destino ahora</Text>
          </View>
          <View style={styles.requestArrowWrap}>
            <Text style={styles.requestArrow}>→</Text>
          </View>
        </View>
        <View style={styles.requestTypes}>
          {['🚗 Económico', '🚙 XL', '⭐ Premium'].map(t => (
            <View key={t} style={styles.typeChip}>
              <Text style={styles.typeChipText}>{t}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Historial */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Historial de viajes</Text>
        <Text style={styles.sectionCount}>{history.length} viajes</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFC61A" style={{ marginTop: 32 }} />
      ) : history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Sin viajes aún</Text>
          <Text style={styles.emptyText}>Solicita tu primer viaje y aparecerá aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderTrip}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, marginBottom: 24 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#555', marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC61A',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#000' },
  requestCard: {
    backgroundColor: '#FFC61A', borderRadius: 20, padding: 20, marginBottom: 28,
  },
  requestContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  requestTitle: { fontSize: 20, fontWeight: '800', color: '#000' },
  requestSub: { fontSize: 13, color: '#00000088', marginTop: 2 },
  requestArrowWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#00000015',
    justifyContent: 'center', alignItems: 'center',
  },
  requestArrow: { fontSize: 20, color: '#000' },
  requestTypes: { flexDirection: 'row', gap: 8 },
  typeChip: { backgroundColor: '#00000015', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeChipText: { fontSize: 12, color: '#000', fontWeight: '600' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  sectionCount: { fontSize: 13, color: '#555' },
  tripCard: {
    backgroundColor: '#161616', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#222',
  },
  tripHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tripIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#222',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  tripIconText: { fontSize: 20 },
  tripMeta: { flex: 1 },
  vehicleType: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 11, fontWeight: '600' },
  tripFare: { color: '#FFC61A', fontWeight: '800', fontSize: 16 },
  tripRoute: { flexDirection: 'row', gap: 12 },
  routeLine: { alignItems: 'center', paddingTop: 4 },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  routeDash: { width: 1, height: 20, backgroundColor: '#333', marginVertical: 3 },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  routeLabels: { flex: 1, gap: 10 },
  routeText: { color: '#888', fontSize: 13 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#555', fontSize: 14, textAlign: 'center' },
});

export default HomeScreen;