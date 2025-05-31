const express = require('express');
const router = express.Router();
const { getAllUserProgress } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/user-progress', authenticateToken, requireAdmin, getAllUserProgress);

module.exports = router;
