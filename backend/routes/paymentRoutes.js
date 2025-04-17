const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const validateEmail = require('../utils/validateEmailWithMailboxlayer');


// Detectar entorno
const isProduction = process.env.NODE_ENV === 'production';

const successUrl = isProduction
  ? 'https://formacion-qalimentaria.vercel.app/registro-final?session_id={CHECKOUT_SESSION_ID}'
  : 'http://localhost:3000/registro-final?session_id={CHECKOUT_SESSION_ID}';

const cancelUrl = isProduction
  ? 'https://formacion-qalimentaria.vercel.app/pago-cancelado'
  : 'http://localhost:3000/pago-cancelado';

router.post('/create-checkout-session', async (req, res) => {
  console.log("🛠️ POST /create-checkout-session llamada desde:", req.headers.origin);
  console.log("📦 Body recibido:", req.body);
  console.log("🎯 Recibida petición a /create-checkout-session");

  const { email } = req.body;

  const isValid = await validateEmail(email);
  console.log("📬 ¿Es válido el correo?", email, "➡️", isValid);
      if (!isValid) {
        return res.status(400).json({
          message: 'El correo electrónico introducido no es válido o no está operativo. Por favor, verifica antes de continuar con el pago.'
        });
      }
      
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Curso de Formación Qalimentaria',
            },
            unit_amount: 5000, // 50,00 €
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log("✅ Sesión de Stripe creada:", session.id);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creando sesión de pago:', error.message);
    res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

module.exports = router;
