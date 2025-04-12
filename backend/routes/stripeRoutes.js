// backend/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/stripeWebhook');

// Necesitamos acceso al rawBody, así que esta ruta debe recibirlo antes del middleware JSON
router.post('/webhook', handleStripeWebhook);

module.exports = router;
