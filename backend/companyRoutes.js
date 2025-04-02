// backend/companyRoutes.js

const express = require('express');
const router = express.Router();
const Company = require('./models/Company');
const { authMiddleware, adminMiddleware } = require('./middleware');

// Crear nueva empresa (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'El nombre de la empresa es obligatorio' });
  }

  try {
    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'La empresa ya existe' });
    }

    const company = new Company({ name: name.trim() });
    await company.save();

    res.status(201).json({ message: 'Empresa creada correctamente', company });
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ✅ ESTA ES LA RUTA GET CORRECTAMENTE DEFINIDA FUERA DEL .post
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (err) {
    console.error('Error al listar empresas:', err);
    res.status(500).json({ message: 'Error al obtener empresas' });
  }
});

module.exports = router;
