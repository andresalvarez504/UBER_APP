import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import CustomButton from '../components/CustomButton';

const METHOD_LABELS = {
  mercadopago: 'MercadoPago',
  debit: 'Tarjeta débito',
  credit: 'Tarjeta crédito',
  cash: 'Efectivo',
};

const InvoiceRow = ({ label, value, highlight = false }) => (
  <View style={styles.invoiceRow}>
    <Text style={styles.invoiceLabel}>{label}</Text>
    <Text style={[styles.invoiceValue, highlight && styles.invoiceValueHighlight]}>{value}</Text>
  </View>
);

const InvoiceScreen = ({ navigation, route }) => {
  const user = useSelector(state => state.user);
  const {
    paymentId, tripId, fare, tax, serviceFee, total,
    origin, destination, vehicleType, method, date,
  } = route.params || {};

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `🧾 Factura UberClone\n` +
          `──────────────────\n` +
          `📍 Origen: ${origin}\n` +
          `🏁 Destino: ${destination}\n` +
          `🚗 Vehículo: ${vehicleType}\n` +
          `──────────────────\n` +
          `Tarifa base: $${fare?.toLocaleString()} COP\n` +
          `IVA (19%): $${tax?.toLocaleString()} COP\n` +
          `Cargo servicio: $${serviceFee?.toLocaleString()} COP\n` +
          `TOTAL: $${total?.toLocaleString()} COP\n` +
          `──────────────────\n` +
          `Método: ${METHOD_LABELS[method] || method}\n` +
          `Estado: ✅ Aprobado\n` +
          `Fecha: ${date}\n` +
          `ID: ${paymentId?.slice(0, 8).toUpperCase()}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* Éxito */}
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Icon name="check-bold" size={40} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>¡Pago exitoso!</Text>
          <Text style={styles.successSub}>Tu viaje ha sido confirmado</Text>
        </View>

        {/* Factura */}
        <View style={styles.invoiceCard}>

          {/* Encabezado */}
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceBrand}>UberClone</Text>
              <Text style={styles.invoiceNum}>Factura #{paymentId?.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.approvedBadge}>
              <Icon name="check-circle" size={14} color="#22C55E" />
              <Text style={styles.approvedText}>Aprobado</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Datos del pasajero */}
          <Text style={styles.sectionLabel}>Pasajero</Text>
          <InvoiceRow label="Nombre" value={user.fullName || '-'} />
          <InvoiceRow label="Correo" value={user.email || '-'} />

          <View style={styles.divider} />

          {/* Ruta */}
          <Text style={styles.sectionLabel}>Viaje</Text>
          <View style={styles.routeWrap}>
            <View style={styles.routeRow}>
              <View style={styles.dotGreen} />
              <Text style={styles.routeText} numberOfLines={2}>{origin}</Text>
            </View>
            <View style={styles.routeLineV} />
            <View style={styles.routeRow}>
              <View style={styles.dotRed} />
              <Text style={styles.routeText} numberOfLines={2}>{destination}</Text>
            </View>
          </View>
          <InvoiceRow label="Tipo de vehículo" value={vehicleType || 'Económico'} />
          <InvoiceRow label="Fecha" value={date || '-'} />

          <View style={styles.divider} />

          {/* Desglose */}
          <Text style={styles.sectionLabel}>Desglose de pago</Text>
          <InvoiceRow label="Tarifa base" value={`$${fare?.toLocaleString()} COP`} />
          <InvoiceRow label="IVA (19%)" value={`$${tax?.toLocaleString()} COP`} />
          <InvoiceRow label="Cargo por servicio (5%)" value={`$${serviceFee?.toLocaleString()} COP`} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>${total?.toLocaleString()} COP</Text>
          </View>

          <View style={styles.divider} />

          {/* Método */}
          <Text style={styles.sectionLabel}>Método de pago</Text>
          <View style={styles.methodWrap}>
            <Icon name="wallet-outline" size={20} color="#00B1EA" />
            <Text style={styles.methodText}>{METHOD_LABELS[method] || method}</Text>
            <View style={styles.approvedBadge}>
              <Icon name="check-circle" size={12} color="#22C55E" />
              <Text style={styles.approvedText}>Aprobado</Text>
            </View>
          </View>

          {/* ID transacción */}
          <View style={styles.transactionWrap}>
            <Icon name="identifier" size={14} color="#555" />
            <Text style={styles.transactionText}>ID: {paymentId}</Text>
          </View>
        </View>

        {/* Acciones */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Icon name="share-outline" size={20} color="#FFC61A" />
          <Text style={styles.shareText}>Compartir factura</Text>
        </TouchableOpacity>

        <CustomButton
          title="Volver al inicio"
          onPress={() => navigation.navigate('Main')}
          icon="home-outline"
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { padding: 20, paddingTop: 60 },
  successWrap: { alignItems: 'center', marginBottom: 28 },
  successCircle: {
    width: 88, height: 88, borderRadius: 28, backgroundColor: '#22C55E',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#22C55E', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  successSub: { fontSize: 14, color: '#555' },
  invoiceCard: { backgroundColor: '#161616', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E1E1E', marginBottom: 16 },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  invoiceBrand: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  invoiceNum: { fontSize: 12, color: '#555', marginTop: 2 },
  approvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  approvedText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 14 },
  sectionLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invoiceLabel: { color: '#777', fontSize: 13 },
  invoiceValue: { color: '#CCC', fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  invoiceValueHighlight: { color: '#FFC61A', fontWeight: '700' },
  routeWrap: { marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', marginTop: 2 },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginTop: 2 },
  routeText: { color: '#AAA', fontSize: 13, flex: 1 },
  routeLineV: { width: 1, height: 12, backgroundColor: '#2A2A2A', marginLeft: 4, marginVertical: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFC61A15', borderRadius: 12, padding: 14, marginTop: 8 },
  totalLabel: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  totalValue: { color: '#FFC61A', fontWeight: '800', fontSize: 20 },
  methodWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodText: { flex: 1, color: '#CCC', fontSize: 14, fontWeight: '600' },
  transactionWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  transactionText: { color: '#444', fontSize: 11 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFC61A15', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#FFC61A33',
  },
  shareText: { color: '#FFC61A', fontWeight: '700', fontSize: 15 },
});

export default InvoiceScreen;
