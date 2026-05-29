import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import CustomButton from '../components/CustomButton';

const InvoiceScreen = ({ navigation, route }) => {
  const user = useSelector(state => state.user);
  const {
    paymentId, mercadoPagoId, tripId,
    fare, tax, serviceFee, total,
    origin, destination, vehicleType,
    method, status, date,
  } = route.params || {};

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `🧾 *Factura UberClone*\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `👤 ${user.fullName}\n` +
          `📧 ${user.email}\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📍 Origen: ${origin}\n` +
          `🏁 Destino: ${destination}\n` +
          `🚗 Vehículo: ${vehicleType}\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `Tarifa base:     $${fare?.toLocaleString()} COP\n` +
          `IVA (19%):       $${tax?.toLocaleString()} COP\n` +
          `Cargo servicio:  $${serviceFee?.toLocaleString()} COP\n` +
          `*TOTAL: $${total?.toLocaleString()} COP*\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `💳 Método: ${method}\n` +
          `✅ Estado: Aprobado\n` +
          `📅 Fecha: ${date}\n` +
          `🆔 Ref MP: ${mercadoPagoId || '-'}\n` +
          `🆔 Ref App: ${paymentId?.slice(0, 8).toUpperCase()}`,
      });
    } catch (e) { console.log(e); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* Éxito */}
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Icon name="check-bold" size={44} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>¡Pago exitoso!</Text>
          <Text style={styles.successSub}>Tu viaje ha sido confirmado y pagado</Text>
        </View>

        {/* Factura */}
        <View style={styles.invoiceCard}>

          {/* Encabezado */}
          <View style={styles.invoiceTop}>
            <View style={styles.invoiceBrandRow}>
              <Icon name="car-sports" size={22} color="#FFC61A" />
              <Text style={styles.invoiceBrand}>UberClone</Text>
            </View>
            <View style={styles.approvedBadge}>
              <Icon name="check-circle" size={13} color="#22C55E" />
              <Text style={styles.approvedText}>Aprobado</Text>
            </View>
          </View>
          <Text style={styles.invoiceNum}>Factura #{paymentId?.slice(0, 8).toUpperCase()}</Text>
          {mercadoPagoId && (
            <Text style={styles.mpId}>ID MercadoPago: {mercadoPagoId}</Text>
          )}

          <View style={styles.divider} />

          {/* Pasajero */}
          <Text style={styles.sectionLabel}>Pasajero</Text>
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={15} color="#555" />
            <Text style={styles.infoText}>{user.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="email-outline" size={15} color="#555" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          {/* Ruta */}
          <Text style={styles.sectionLabel}>Detalle del viaje</Text>
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
          <View style={styles.infoRow}>
            <Icon name="car-outline" size={15} color="#555" />
            <Text style={styles.infoText}>{vehicleType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={15} color="#555" />
            <Text style={styles.infoText}>{date}</Text>
          </View>

          <View style={styles.divider} />

          {/* Desglose */}
          <Text style={styles.sectionLabel}>Desglose de pago</Text>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Tarifa base</Text><Text style={styles.priceValue}>${fare?.toLocaleString()} COP</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>IVA (19%)</Text><Text style={styles.priceValue}>${tax?.toLocaleString()} COP</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Cargo por servicio (5%)</Text><Text style={styles.priceValue}>${serviceFee?.toLocaleString()} COP</Text></View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAGADO</Text>
            <Text style={styles.totalValue}>${total?.toLocaleString()} COP</Text>
          </View>

          <View style={styles.divider} />

          {/* Método */}
          <Text style={styles.sectionLabel}>Método de pago</Text>
          <View style={styles.methodRow}>
            <Icon name="credit-card-outline" size={18} color="#00B1EA" />
            <Text style={styles.methodText}>{method}</Text>
            <View style={styles.approvedBadge}>
              <Icon name="check-circle" size={12} color="#22C55E" />
              <Text style={styles.approvedText}>Aprobado</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Icon name="share-variant-outline" size={20} color="#FFC61A" />
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
    width: 90, height: 90, borderRadius: 28, backgroundColor: '#22C55E',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#22C55E', shadowOpacity: 0.5, shadowRadius: 24, elevation: 14,
  },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  successSub: { fontSize: 14, color: '#555', textAlign: 'center' },
  invoiceCard: { backgroundColor: '#161616', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E1E1E', marginBottom: 16 },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  invoiceBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invoiceBrand: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  approvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  approvedText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  invoiceNum: { color: '#555', fontSize: 12, marginBottom: 2 },
  mpId: { color: '#444', fontSize: 11 },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 14 },
  sectionLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { color: '#AAA', fontSize: 13, flex: 1 },
  routeWrap: { marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', marginTop: 3 },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginTop: 3 },
  routeText: { color: '#AAA', fontSize: 13, flex: 1 },
  routeLineV: { width: 1, height: 12, backgroundColor: '#2A2A2A', marginLeft: 4, marginVertical: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: '#777', fontSize: 13 },
  priceValue: { color: '#CCC', fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFC61A15', borderRadius: 12, padding: 14, marginTop: 6 },
  totalLabel: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  totalValue: { color: '#FFC61A', fontWeight: '800', fontSize: 20 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodText: { flex: 1, color: '#CCC', fontSize: 14, fontWeight: '600' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFC61A15', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#FFC61A33',
  },
  shareText: { color: '#FFC61A', fontWeight: '700', fontSize: 15 },
});

export default InvoiceScreen;