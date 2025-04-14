// backend/controllers/stripeWebhook.js
const Stripe = require('stripe');
const CompanyCode = require('../models/CompanyCode');
const sendCodeEmail = require('../utils/sendEmail');


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handleStripeWebhook = async (req, res) => {
  try {
    console.log('📦 Tipo real de req.body:', typeof req.body);
    console.log('📦 Contenido de req.body:', req.body);

    const event = stripe.webhooks.constructEvent(
      req.body.toString('utf8'),
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('✅ Evento recibido de Stripe:', event?.type);

    if (
      event?.type === 'checkout.session.completed' &&
      event?.data?.object?.customer_email
    ) {

      const session = event.data.object;
      const email = session.customer_email;
    
      console.log('📧 Email recibido:', email);
    
      // Verificar si ya existe un código activo para este email
      const existingCode = await CompanyCode.findOne({ email, active: true });
    
      if (existingCode) {
        console.warn(`⚠️ Ya existe un código activo para el email ${email}, se omite la creación.`);
        return res.status(200).send(); // OK para Stripe
      }
    
      // Generar código
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `PARTICULAR-${randomSuffix}`;
    
      const newCode = new CompanyCode({
        code,
        active: true,
        createdByStripe: true, 
        email,
        usedUsers: 0, // ✅ corregido correctamente
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        maxUsers: 1,
        formationType: 'básica',
        company: '67fa5f2950aafe5edec6aa17',
    });
        
      await newCode.save();
      console.log('✅ Guardado en MongoDB:', newCode);

      try {
        await sendCodeEmail(email, code);
        console.log(`✅ Código enviado a ${email}: ${code}`);
      } catch (err) {
        console.error(`❌ Error al enviar email a ${email}:`, err);
      }
      
    
    } else {
      console.warn(`⚠️ Evento ignorado: ${event?.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Error al procesar el webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
