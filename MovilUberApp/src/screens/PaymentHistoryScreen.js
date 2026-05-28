import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../storage/Firebase.config';

const METHOD_ICONS = {
  mercadopago: { icon: 'wallet-outline', color: '#00B1EA' },
  debit:       { icon: 'credit-card-outline', color: '#22C55E' },
  credit:      { icon: 'credit-card-plus-outline', color: '#A855F7' },
  cash:        { icon: 'cash', color: '#FFC61A' },
};

const METHOD_LABELS = {
  mercadopago: 'MercadoPago',
  debit: 'Tarjeta débito',
  credit: 'Tarjeta crédito',
  cash: 'Efectivo',
};

const STATUS_CONFIG = {
  approved: { color: '#22C55E', label: 'Aprobado', icon: 'check-circle-outline' },
  pending:  { color: '#FFC61A', label: 'Pendiente', icon: 'clock-outline' },
  rejected: { color: '#EF4444', label: 'Rechazado', icon: 'close-circle-outline' },
};

const PaymentHistoryScreen = ({ navigation }) => {
  const user = useSelector(state => state.user);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalSpent = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const fetchPayments = useCallback(async () => {
    if (!user.uid) return;
    try {
      const q = query(
        collection(db, 'payments'),
        where('passengerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );
      const snapshot = await getDocs(q);
      setPayments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.log('fetchPayments error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.uid]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const onRefresh = () => { setRefreshing(true); fetchPayments(); };

  const renderPayment = ({ item }) => {
    const m = METHOD_ICONS[item.method] || METHOD_ICONS.mercadopago;
    const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const date = item.createdAt?.toDate?.()?.toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric',
    }) || '-';

    return (
      <View style={styles.payCard}>
        <View style={styles.payTop}>
          <View style={[styles.payIcon, { backgroundColor: m.color + '22' }]}>
            <Icon name={m.icon} size={22} color={m.color} />
          </View>
          <View style={styles.payInfo}>
            <Text style={styles.payMethod}>{METHOD_LABELS[item.method] || item.method}</Text>
            <Text style={styles.payDate}>{date}</Text>
          </View>
          <View style={styles.payRight}>
            <Text style={styles.payAmount}>${item.amount?.toLocaleString()}</Text>
            <Text style={styles.payCurrency}>COP</Text>
          </View>
        </View>
        <View style={styles.payDivider} />
        <View style={styles.payBottom}>
          <View style={[styles.statusBadge, { backgroundColor: s.color + '22' }]}>
            <Icon name={s.icon} size={12} color={s.color} />
            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>
          <Text style={styles.payId}>ID: {item.id?.slice(0, 8).toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de pagos</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Icon name="receipt" size={22} color="#FFC61A" />
          <Text style={styles.statValue}>{payments.length}</Text>
          <Text style={styles.statLabel}>Pagos</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="check-decagram-outline" size={22} color="#22C55E" />
          <Text style={styles.statValue}>{payments.filter(p => p.status === 'approved').length}</Text>
          <Text style={styles.statLabel}>Aprobados</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="cash-multiple" size={22} color="#60A5FA" />
          <Text style={styles.statValue}>${(totalSpent / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Total COP</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFC61A" style={{ marginTop: 40 }} />
      ) : payments.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="receipt-text-outline" size={56} color="#222" />
          <Text style={styles.emptyTitle}>Sin pagos aún</Text>
          <Text style={styles.emptyText}>Tus pagos aparecerán aquí después de un viaje.</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={renderPayment}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFC61A" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#161616', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1E1E1E' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#555', marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  payCard: { backgroundColor: '#161616', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E1E1E' },
  payTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  payIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  payInfo: { flex: 1 },
  payMethod: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  payDate: { color: '#555', fontSize: 12, marginTop: 3 },
  payRight: { alignItems: 'flex-end' },
  payAmount: { color: '#FFC61A', fontWeight: '800', fontSize: 17 },
  payCurrency: { color: '#555', fontSize: 10, marginTop: 2 },
  payDivider: { height: 1, backgroundColor: '#1E1E1E', marginBottom: 10 },
  payBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  payId: { color: '#444', fontSize: 11 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { color: '#333', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyText: { color: '#333', fontSize: 14, textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },
});

export default PaymentHistoryScreen;
