// backend/companyRoutes.js

const express = require('express');
const router = express.Router();

const authMiddleware = require('./middleware/auth');      // ✅ clave correcta
const { adminMiddleware } = require('./middleware');      // ✅ aquí SÓLO sacamos adminMiddleware

const Company = require('./models/Company');

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
// Cambiar estado activo/inactivo de una empresa (solo admin)
router.patch('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    company.active = !company.active;
    await company.save();

    res.json({ message: 'Estado actualizado correctamente', company });
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener una empresa por ID (solo admin)
  router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {

  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error al obtener empresa por ID:', error);
    res.status(500).json({ message: 'Error al obtener empresa' });
  }
});

// Actualizar datos de empresa (solo admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { address, phone, cif, email } = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      {
        $set: { address, phone, cif, email }
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ message: 'Error al actualizar empresa' });
  }
});


module.exports = router;
