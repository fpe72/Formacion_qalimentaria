// backend/controllers/stripeWebhook.js
const Stripe = require('stripe');
const CompanyCode = require('../models/CompanyCode');
const nodemailer = require('nodemailer');

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
    
      // Enviar email (aunque falle, no duplicará código)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    
      const mailOptions = {
        from: `"Formación Qalimentaria" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Tu código de activación',
        html: `<p>Hola,</p>
               <p>Gracias por tu compra. Aquí tienes tu <strong>código de activación</strong>:</p>
               <h2>${code}</h2>
               <p>Úsalo para completar tu registro en <a href="https://formacionqalimentaria.com">Formación Qalimentaria</a>.</p>
               <p>Un saludo,<br>El equipo de Formación Qalimentaria</p>`,
      };
    
      await transporter.sendMail(mailOptions);
      console.log(`✅ Código enviado a ${email}: ${code}`);
    

    } else {
      console.warn(`⚠️ Evento ignorado: ${event?.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Error al procesar el webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
