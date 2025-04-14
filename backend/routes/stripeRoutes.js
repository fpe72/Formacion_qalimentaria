// backend/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/stripeWebhook');
const sendCodeEmail = require('../utils/sendEmail');


// Necesitamos acceso al rawBody, así que esta ruta debe recibirlo antes del middleware JSON
router.post('/webhook', handleStripeWebhook);

// NUEVO ENDPOINT para mostrar info del curso actual
router.get('/course-info', (req, res) => {
    const courseInfo = {
      name: "Formación básica",
      price: 50.00, // en euros
      currency: "EUR"
    };
    res.json(courseInfo);
  });  
  
// ✅ Endpoint temporal para probar email desde Render
router.get('/test-smtp', async (req, res) => {
  try {
    const to = 'fpe1972@gmail.com'; // Cámbialo si quieres probar con otro correo
    const code = 'TEST123';
    await sendCodeEmail(to, code);
    res.send('✅ Email enviado desde Render a ' + to);
  } catch (err) {
    console.error('❌ Error en Render al enviar email:', err);
    res.status(500).send('❌ Fallo SMTP en Render');
  }
});


module.exports = router;
