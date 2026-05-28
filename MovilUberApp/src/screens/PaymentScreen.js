import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../storage/Firebase.config';
import CustomButton from '../components/CustomButton';

const PAYMENT_METHODS = [
  { id: 'mercadopago', label: 'MercadoPago', icon: 'wallet-outline', color: '#00B1EA' },
  { id: 'debit',       label: 'Tarjeta débito', icon: 'credit-card-outline', color: '#22C55E' },
  { id: 'credit',      label: 'Tarjeta crédito', icon: 'credit-card-plus-outline', color: '#A855F7' },
  { id: 'cash',        label: 'Efectivo', icon: 'cash', color: '#FFC61A' },
];

const PaymentScreen = ({ navigation, route }) => {
  const user = useSelector(state => state.user);
  const { tripId, fare, origin, destination, vehicleType } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState('mercadopago');
  const [loading, setLoading] = useState(false);

  const tax = Math.round(fare * 0.19);
  const serviceFee = Math.round(fare * 0.05);
  const total = fare + tax + serviceFee;

  const handlePay = async () => {
    setLoading(true);
    try {
      // Simular procesamiento MercadoPago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Guardar pago en Firestore
      const payRef = await addDoc(collection(db, 'payments'), {
        tripId: tripId || 'unknown',
        passengerId: user.uid,
        amount: total,
        fare,
        tax,
        serviceFee,
        method: selectedMethod,
        status: 'approved',
        createdAt: Timestamp.now(),
      });

      // Navegar a la factura
      navigation.replace('Invoice', {
        paymentId: payRef.id,
        tripId, fare, tax, serviceFee, total,
        origin, destination, vehicleType,
        method: selectedMethod,
        date: new Date().toLocaleString('es-CO'),
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>

        {/* Resumen del viaje */}
        <View style={styles.tripSummary}>
          <View style={styles.summaryHeader}>
            <Icon name="car-outline" size={20} color="#FFC61A" />
            <Text style={styles.summaryTitle}>Resumen del viaje</Text>
          </View>
          <View style={styles.routeWrap}>
            <View style={styles.routeRow}>
              <View style={styles.dotGreen} />
              <Text style={styles.routeText} numberOfLines={1}>{origin || 'Origen'}</Text>
            </View>
            <View style={styles.routeLineV} />
            <View style={styles.routeRow}>
              <View style={styles.dotRed} />
              <Text style={styles.routeText} numberOfLines={1}>{destination || 'Destino'}</Text>
            </View>
          </View>
          <View style={styles.summaryBadge}>
            <Icon name="car-outline" size={14} color="#888" />
            <Text style={styles.summaryBadgeText}>{vehicleType || 'Económico'}</Text>
          </View>
        </View>

        {/* Desglose de precio */}
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>Desglose</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tarifa base</Text>
            <Text style={styles.priceValue}>${fare?.toLocaleString()} COP</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>IVA (19%)</Text>
            <Text style={styles.priceValue}>${tax?.toLocaleString()} COP</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cargo por servicio (5%)</Text>
            <Text style={styles.priceValue}>${serviceFee?.toLocaleString()} COP</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total?.toLocaleString()} COP</Text>
          </View>
        </View>

        {/* Métodos de pago */}
        <Text style={styles.sectionLabel}>Método de pago</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodCard, selectedMethod === m.id && styles.methodSelected]}
            onPress={() => setSelectedMethod(m.id)}
            activeOpacity={0.8}>
            <View style={[styles.methodIcon, { backgroundColor: m.color + '22' }]}>
              <Icon name={m.icon} size={22} color={m.color} />
            </View>
            <Text style={[styles.methodLabel, selectedMethod === m.id && styles.methodLabelSelected]}>
              {m.label}
            </Text>
            {selectedMethod === m.id && (
              <Icon name="check-circle" size={20} color="#FFC61A" />
            )}
          </TouchableOpacity>
        ))}

        {/* Seguridad */}
        <View style={styles.secureWrap}>
          <Icon name="shield-check-outline" size={16} color="#555" />
          <Text style={styles.secureText}>Pago seguro procesado por MercadoPago</Text>
        </View>

        <CustomButton
          title={loading ? 'Procesando...' : `Pagar $${total?.toLocaleString()} COP`}
          onPress={handlePay}
          loading={loading}
          icon="lock-outline"
        />
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  inner: { padding: 20 },
  tripSummary: { backgroundColor: '#161616', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#1E1E1E' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  summaryTitle: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  routeWrap: { marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  routeText: { color: '#AAA', fontSize: 13, flex: 1 },
  routeLineV: { width: 1, height: 14, backgroundColor: '#2A2A2A', marginLeft: 4, marginVertical: 3 },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0A0A0A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  summaryBadgeText: { color: '#888', fontSize: 12 },
  priceCard: { backgroundColor: '#161616', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#1E1E1E' },
  cardTitle: { color: '#FFF', fontWeight: '700', fontSize: 15, marginBottom: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { color: '#777', fontSize: 14 },
  priceValue: { color: '#CCC', fontSize: 14, fontWeight: '500' },
  priceDivider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 10 },
  totalLabel: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  totalValue: { color: '#FFC61A', fontWeight: '800', fontSize: 18 },
  sectionLabel: { color: '#555', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#161616', borderRadius: 16, padding: 16,
    marginBottom: 8, borderWidth: 1.5, borderColor: '#1E1E1E',
  },
  methodSelected: { borderColor: '#FFC61A' },
  methodIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  methodLabel: { flex: 1, color: '#AAA', fontSize: 15, fontWeight: '500' },
  methodLabelSelected: { color: '#FFF', fontWeight: '700' },
  secureWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginVertical: 16 },
  secureText: { color: '#555', fontSize: 12 },
});

export default PaymentScreen;
