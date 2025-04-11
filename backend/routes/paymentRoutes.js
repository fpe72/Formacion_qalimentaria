const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');

router.post('/create-checkout-session', async (req, res) => {
  const { email } = req.body;

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
            unit_amount: 1999, // en céntimos => 19.99 €
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://reimagined-giggle-5gx75pv6r69xc4xvw-3000.app.github.dev/registro-final?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://reimagined-giggle-5gx75pv6r69xc4xvw-3000.app.github.dev/pago-cancelado',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creando sesión de pago:', error.message);
    res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

module.exports = router;
