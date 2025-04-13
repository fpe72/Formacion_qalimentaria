// backend/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/stripeWebhook');

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

module.exports = router;
