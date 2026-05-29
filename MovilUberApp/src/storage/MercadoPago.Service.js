/**
 * MercadoPago.Service.js
 * Checkout API — Sandbox Colombia
 */

// ⚠️ Reemplaza con tus credenciales TEST cuando las actives
const ACCESS_TOKEN = 'APP_USR-5435200865733258-052820-a948a72f1f69d4d37d7f0f58bed12504-3434683346';
const PUBLIC_KEY   = 'APP_USR-55926f1e-f0d7-4e4d-a77a-a7f38863b719';

const MP_BASE = 'https://api.mercadopago.com';

// ── Detectar marca de tarjeta por BIN ──────────────────
export const getPaymentMethod = async (bin) => {
  try {
    const res = await fetch(
      `${MP_BASE}/v1/payment_methods/search?public_key=${PUBLIC_KEY}&bin=${bin}&site_id=MCO`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) ? results[0] : null;
  } catch (e) {
    console.log('getPaymentMethod error:', e);
    return null;
  }
};

// ── Tokenizar tarjeta ──────────────────────────────────
export const createCardToken = async (cardData) => {
  const body = {
    card_number:       cardData.cardNumber.replace(/\s/g, ''),
    expiration_month:  parseInt(cardData.expirationMonth, 10),
    expiration_year:   parseInt(`20${cardData.expirationYear}`, 10),
    security_code:     cardData.securityCode,
    cardholder: {
      name: cardData.cardholderName.toUpperCase(),
      identification: {
        type:   cardData.docType   || 'CC',
        number: cardData.docNumber || '12345678',
      },
    },
  };

  const res = await fetch(
    `${MP_BASE}/v1/card_tokens?public_key=${PUBLIC_KEY}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }
  );

  const data = await res.json();
  console.log('Token response:', JSON.stringify(data));

  if (!res.ok || data.error || !data.id) {
    const msg = data.cause?.[0]?.description
             || data.message
             || 'Error al tokenizar tarjeta';
    throw new Error(msg);
  }
  return data;
};

// ── Procesar pago ──────────────────────────────────────
export const processPayment = async ({
  token, amount, installments = 1,
  paymentMethodId, email,
  docType = 'CC', docNumber = '12345678',
  description,
}) => {
  // MercadoPago Colombia (MCO) trabaja en pesos enteros
  const transactionAmount = Math.round(amount);

  const body = {
    token,
    transaction_amount: transactionAmount,
    installments,
    payment_method_id: paymentMethodId || 'visa',
    payer: {
      email,
      identification: { type: docType, number: docNumber },
    },
    description:          description || 'UberClone viaje',
    statement_descriptor: 'UBERCLONE',
    binary_mode:          true, // sin estado "in_process"
  };

  const res = await fetch(`${MP_BASE}/v1/payments`, {
    method:  'POST',
    headers: {
      Authorization:      `Bearer ${ACCESS_TOKEN}`,
      'Content-Type':     'application/json',
      'X-Idempotency-Key': `${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log('Payment response:', JSON.stringify(data));

  if (!res.ok) {
    const msg = data.message || data.error || 'Error al procesar pago';
    throw new Error(msg);
  }
  return data;
};

// ── Tarjetas de prueba Colombia ────────────────────────
export const TEST_CARDS = [
  {
    brand:  'Mastercard ✅ Aprobada',
    number: '5254 1336 7440 3564',
    cvv:    '123',
    expiry: '11/30',
    name:   'APRO',
  },
  {
    brand:  'Visa ✅ Aprobada',
    number: '4013 5406 8274 6260',
    cvv:    '123',
    expiry: '11/30',
    name:   'APRO',
  },
  {
    brand:  'Visa Débito ✅ Aprobada',
    number: '4915 1120 5524 6507',
    cvv:    '123',
    expiry: '11/30',
    name:   'APRO',
  },
];