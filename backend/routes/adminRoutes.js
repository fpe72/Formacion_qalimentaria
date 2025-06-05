const express = require('express');
const router = express.Router();

// Controladores
const { getAllUserProgress, downloadDiplomaByUser } = require('../controllers/adminController');

// Middleware de autenticación y autorización
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Ruta ya existente: progreso de todos los usuarios
router.get('/user-progress', authenticateToken, requireAdmin, getAllUserProgress);

// NUEVA RUTA: descarga de diploma por parte del administrador
router.get('/diploma/:userId', authenticateToken, requireAdmin, downloadDiplomaByUser);

module.exports = router;

