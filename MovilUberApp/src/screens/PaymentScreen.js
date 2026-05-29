import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../storage/Firebase.config';
import {
  createCardToken, processPayment,
  getPaymentMethod, TEST_CARDS,
} from '../storage/MercadoPago.Service';
import CustomButton from '../components/CustomButton';

const fmtCard   = v => v.replace(/\D/g,'').slice(0,16).match(/.{1,4}/g)?.join(' ') || '';
const fmtExpiry = v => { const c = v.replace(/\D/g,'').slice(0,4); return c.length>=2?`${c.slice(0,2)}/${c.slice(2)}`:c; };

const PaymentScreen = ({ navigation, route }) => {
  const user = useSelector(s => s.user);
  const { tripId, fare, origin, destination, vehicleType } = route.params || {};

  const tax        = Math.round((fare||0) * 0.19);
  const serviceFee = Math.round((fare||0) * 0.05);
  const total      = (fare||0) + tax + serviceFee;

  const [cardNumber,  setCardNumber]  = useState('');
  const [cardHolder,  setCardHolder]  = useState('');
  const [expiry,      setExpiry]      = useState('');
  const [cvv,         setCvv]         = useState('');
  const [docType,     setDocType]     = useState('CC');
  const [docNumber,   setDocNumber]   = useState('');
  const [pmId,        setPmId]        = useState('');
  const [cardBrand,   setCardBrand]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});
  const [showTests,   setShowTests]   = useState(false);

  // Detectar marca por BIN
  useEffect(() => {
    const bin = cardNumber.replace(/\s/g,'').slice(0,6);
    if (bin.length === 6) {
      getPaymentMethod(bin).then(m => {
        if (m) { setPmId(m.id); setCardBrand(m.name); }
      });
    } else { setPmId(''); setCardBrand(''); }
  }, [cardNumber]);

  const fillTestCard = (card) => {
    setCardNumber(card.number);
    setExpiry(card.expiry);
    setCvv(card.cvv);
    setCardHolder(card.name);
    setShowTests(false);
  };

  const validate = () => {
    const e = {};
    if (cardNumber.replace(/\s/g,'').length < 15) e.cardNumber = 'Número inválido';
    if (!cardHolder.trim())                        e.cardHolder = 'Ingresa el titular';
    if (expiry.length < 5)                         e.expiry     = 'Fecha inválida MM/AA';
    if (cvv.length < 3)                            e.cvv        = 'CVV inválido';
    if (!docNumber.trim())                         e.docNumber  = 'Ingresa tu documento';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const [mm, yy] = expiry.split('/');

      // 1. Tokenizar
      const tokenData = await createCardToken({
        cardNumber,
        expirationMonth: mm,
        expirationYear:  yy,
        securityCode:    cvv,
        cardholderName:  cardHolder,
        docType,
        docNumber,
      });

      // 2. Cobrar
      const payment = await processPayment({
        token:           tokenData.id,
        amount:          total,
        installments:    1,
        paymentMethodId: pmId || 'visa',
        email:           user.email,
        docType,
        docNumber,
        description:     `UberClone ${origin} → ${destination}`,
      });

      // 3. Estado
      const st = payment.status === 'approved' ? 'approved'
               : payment.status === 'in_process' ? 'pending'
               : 'rejected';

      // 4. Guardar en Firestore
      const payRef = await addDoc(collection(db, 'payments'), {
        tripId:              tripId || '',
        passengerId:         user.uid,
        mercadoPagoId:       String(payment.id || ''),
        mercadoPagoStatus:   payment.status || '',
        mercadoPagoDetail:   payment.status_detail || '',
        amount:              total,
        fare,
        tax,
        serviceFee,
        method:              pmId || 'visa',
        cardBrand,
        status:              st,
        createdAt:           Timestamp.now(),
      });

      if (st === 'approved') {
        navigation.replace('Invoice', {
          paymentId:      payRef.id,
          mercadoPagoId:  String(payment.id),
          tripId, fare, tax, serviceFee, total,
          origin, destination, vehicleType,
          method: cardBrand || pmId || 'Tarjeta',
          status: 'approved',
          date:   new Date().toLocaleString('es-CO'),
        });
      } else if (st === 'pending') {
        Alert.alert('⏳ En proceso', 'Tu pago está siendo revisado.', [
          { text: 'OK', onPress: () => navigation.navigate('Main') },
        ]);
      } else {
        Alert.alert(
          '❌ Pago rechazado',
          `Motivo: ${payment.status_detail || 'error'}.\n\nIntenta con otra tarjeta o usa una tarjeta de prueba.`
        );
      }
    } catch (e) {
      console.log('handlePay error:', e);
      Alert.alert('Error', e.message || 'No se pudo procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, err, children }) => (
    <View style={s.field}>
      <View style={s.fieldLabelRow}>
        <Icon name={icon} size={13} color="#FFC61A" />
        <Text style={s.fieldLabel}>{label}</Text>
      </View>
      {children}
      {err ? <Text style={s.err}>{err}</Text> : null}
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Pagar con tarjeta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

        {/* Resumen */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Icon name="car-outline" size={17} color="#FFC61A" />
            <Text style={s.cardTitle}>Resumen del viaje</Text>
          </View>
          <View style={s.rrow}><View style={s.dg}/><Text style={s.rt} numberOfLines={1}>{origin}</Text></View>
          <View style={s.rvline}/>
          <View style={s.rrow}><View style={s.dr}/><Text style={s.rt} numberOfLines={1}>{destination}</Text></View>
          <View style={s.div}/>
          <View style={s.prow}><Text style={s.pl}>Tarifa base</Text><Text style={s.pv}>${fare?.toLocaleString()} COP</Text></View>
          <View style={s.prow}><Text style={s.pl}>IVA (19%)</Text><Text style={s.pv}>${tax?.toLocaleString()} COP</Text></View>
          <View style={s.prow}><Text style={s.pl}>Cargo servicio (5%)</Text><Text style={s.pv}>${serviceFee?.toLocaleString()} COP</Text></View>
          <View style={s.totalRow}>
            <Text style={s.tl}>TOTAL</Text>
            <Text style={s.tv}>${total?.toLocaleString()} COP</Text>
          </View>
        </View>

        {/* Tarjetas de prueba */}
        <TouchableOpacity style={s.testBtn} onPress={() => setShowTests(!showTests)}>
          <Icon name="test-tube" size={16} color="#FFC61A" />
          <Text style={s.testBtnText}>Tarjetas de prueba MercadoPago</Text>
          <Icon name={showTests ? 'chevron-up' : 'chevron-down'} size={16} color="#FFC61A" />
        </TouchableOpacity>

        {showTests && (
          <View style={s.testWrap}>
            <Text style={s.testNote}>Toca una para autocompletar · Titular: APRO o OTHE · Doc: 12345678</Text>
            {[
              { brand:'Mastercard ✅', number:'5254 1336 7440 3564', cvv:'123', expiry:'11/30', name:'APRO' },
              { brand:'Visa ✅',       number:'4013 5406 8274 6260', cvv:'123', expiry:'11/30', name:'APRO' },
              { brand:'Visa Débito ✅',number:'4915 1120 5524 6507', cvv:'123', expiry:'11/30', name:'APRO' },
            ].map((c, i) => (
              <TouchableOpacity key={i} style={s.testCard} onPress={() => fillTestCard(c)}>
                <Text style={s.testBrand}>{c.brand}</Text>
                <Text style={s.testNum}>{c.number}</Text>
                <Text style={s.testMeta}>CVV {c.cvv}  ·  Vence {c.expiry}  ·  Titular: APRO</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Formulario tarjeta */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Icon name="credit-card-outline" size={17} color="#FFC61A" />
            <Text style={s.cardTitle}>Datos de la tarjeta</Text>
            {cardBrand ? <View style={s.brand}><Text style={s.brandTxt}>{cardBrand}</Text></View> : null}
          </View>

          <Field label="Número de tarjeta" icon="credit-card-outline" err={errors.cardNumber}>
            <View style={[s.inp, errors.cardNumber && s.inpErr]}>
              <TextInput style={s.inpText} value={cardNumber} onChangeText={v => setCardNumber(fmtCard(v))}
                placeholder="1234 5678 9012 3456" placeholderTextColor="#444" keyboardType="numeric" maxLength={19}/>
            </View>
          </Field>

          <Field label="Titular (como aparece en la tarjeta)" icon="account-outline" err={errors.cardHolder}>
            <View style={[s.inp, errors.cardHolder && s.inpErr]}>
              <TextInput style={s.inpText} value={cardHolder} onChangeText={setCardHolder}
                placeholder="NOMBRE APELLIDO" placeholderTextColor="#444" autoCapitalize="characters"/>
            </View>
          </Field>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Vencimiento" icon="calendar-outline" err={errors.expiry}>
                <View style={[s.inp, errors.expiry && s.inpErr]}>
                  <TextInput style={s.inpText} value={expiry} onChangeText={v => setExpiry(fmtExpiry(v))}
                    placeholder="MM/AA" placeholderTextColor="#444" keyboardType="numeric" maxLength={5}/>
                </View>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="CVV" icon="lock-outline" err={errors.cvv}>
                <View style={[s.inp, errors.cvv && s.inpErr]}>
                  <TextInput style={s.inpText} value={cvv} onChangeText={v => setCvv(v.replace(/\D/g,'').slice(0,4))}
                    placeholder="123" placeholderTextColor="#444" keyboardType="numeric" secureTextEntry maxLength={4}/>
                </View>
              </Field>
            </View>
          </View>
        </View>

        {/* Documento */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Icon name="card-account-details-outline" size={17} color="#FFC61A" />
            <Text style={s.cardTitle}>Identificación</Text>
          </View>

          <Text style={s.fieldLabel}>Tipo de documento</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 4 }}>
            {['CC','CE','NIT','PP'].map(t => (
              <TouchableOpacity key={t}
                style={[s.docBtn, docType === t && s.docBtnSel]}
                onPress={() => setDocType(t)}>
                <Text style={[s.docBtnTxt, docType === t && s.docBtnTxtSel]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field label="Número de documento" icon="identifier" err={errors.docNumber}>
            <View style={[s.inp, errors.docNumber && s.inpErr]}>
              <TextInput style={s.inpText} value={docNumber} onChangeText={v => setDocNumber(v.replace(/\D/g,''))}
                placeholder="12345678" placeholderTextColor="#444" keyboardType="numeric"/>
            </View>
          </Field>
        </View>

        <View style={s.secRow}>
          <Icon name="shield-check-outline" size={15} color="#22C55E"/>
          <Text style={s.secTxt}>Pago seguro · SSL · MercadoPago</Text>
        </View>

        <CustomButton title={`Pagar $${total?.toLocaleString()} COP`} onPress={handlePay} loading={loading} icon="lock-outline"/>

        <View style={{ height: 40 }}/>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#0A0A0A' },
  header:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingTop:52, paddingHorizontal:20, paddingBottom:16 },
  backBtn:     { width:40, height:40, borderRadius:12, backgroundColor:'#161616', justifyContent:'center', alignItems:'center' },
  headerTitle: { fontSize:18, fontWeight:'800', color:'#FFF' },
  inner:       { padding:20 },
  card:        { backgroundColor:'#161616', borderRadius:20, padding:18, marginBottom:14, borderWidth:1, borderColor:'#1E1E1E' },
  cardHead:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:14 },
  cardTitle:   { flex:1, color:'#FFF', fontWeight:'700', fontSize:15 },
  brand:       { backgroundColor:'#FFC61A22', paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  brandTxt:    { color:'#FFC61A', fontSize:12, fontWeight:'700' },
  rrow:        { flexDirection:'row', alignItems:'center', gap:10 },
  dg:          { width:10, height:10, borderRadius:5, backgroundColor:'#22C55E' },
  dr:          { width:10, height:10, borderRadius:5, backgroundColor:'#EF4444' },
  rt:          { color:'#AAA', fontSize:13, flex:1 },
  rvline:      { width:1, height:12, backgroundColor:'#2A2A2A', marginLeft:4, marginVertical:3 },
  div:         { height:1, backgroundColor:'#2A2A2A', marginVertical:12 },
  prow:        { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  pl:          { color:'#777', fontSize:13 },
  pv:          { color:'#CCC', fontSize:13 },
  totalRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#FFC61A15', borderRadius:10, padding:12, marginTop:4 },
  tl:          { color:'#FFF', fontWeight:'800', fontSize:15 },
  tv:          { color:'#FFC61A', fontWeight:'800', fontSize:18 },
  testBtn:     { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#FFC61A15', borderRadius:12, padding:12, marginBottom:10, borderWidth:1, borderColor:'#FFC61A33' },
  testBtnText: { flex:1, color:'#FFC61A', fontWeight:'600', fontSize:13 },
  testWrap:    { backgroundColor:'#161616', borderRadius:16, padding:16, marginBottom:14, borderWidth:1, borderColor:'#2A2A2A' },
  testNote:    { color:'#555', fontSize:11, marginBottom:12, textAlign:'center' },
  testCard:    { backgroundColor:'#0A0A0A', borderRadius:10, padding:12, marginBottom:8, borderWidth:1, borderColor:'#2A2A2A' },
  testBrand:   { color:'#FFC61A', fontWeight:'700', fontSize:13, marginBottom:4 },
  testNum:     { color:'#CCC', fontSize:14, fontFamily:'monospace' },
  testMeta:    { color:'#555', fontSize:12, marginTop:3 },
  field:       { marginBottom:12 },
  fieldLabelRow:{ flexDirection:'row', alignItems:'center', gap:5, marginBottom:6 },
  fieldLabel:  { color:'#777', fontSize:12, fontWeight:'600' },
  inp:         { backgroundColor:'#0A0A0A', borderRadius:12, borderWidth:1, borderColor:'#2A2A2A', height:50, justifyContent:'center', paddingHorizontal:14 },
  inpErr:      { borderColor:'#EF4444' },
  inpText:     { color:'#FFF', fontSize:15 },
  err:         { color:'#EF4444', fontSize:11, marginTop:3 },
  docBtn:      { paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:'#2A2A2A', backgroundColor:'#0A0A0A' },
  docBtnSel:   { backgroundColor:'#FFC61A', borderColor:'#FFC61A' },
  docBtnTxt:   { color:'#777', fontSize:13, fontWeight:'600' },
  docBtnTxtSel:{ color:'#000', fontWeight:'700' },
  secRow:      { flexDirection:'row', alignItems:'center', gap:8, justifyContent:'center', marginBottom:16 },
  secTxt:      { color:'#555', fontSize:12 },
});

export default PaymentScreen;