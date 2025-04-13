const express = require("express");
const router = express.Router();
const CompanyCode = require("../models/CompanyCode");
const Company = require("../models/Company"); // 👈 importa el modelo real de empresa
const { authenticateToken, requireAdmin } = require("../middleware/auth");
console.log("authenticateToken:", typeof authenticateToken);
console.log("requireAdmin:", typeof requireAdmin);


router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, companyId, formationType, maxUsers, expiresAt } = req.body;

    // Validación de campos requeridos
    if (!code || !companyId || !formationType || !maxUsers || !expiresAt) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar que la empresa exista y esté activa
    const company = await Company.findById(companyId);
    if (!company || !company.active) {
      return res.status(404).json({ message: "Empresa no encontrada o inactiva" });
    }

    // Verificar que el código no exista ya
    const existing = await CompanyCode.findOne({ code });
    if (existing) {
      return res.status(409).json({ message: "Este código ya existe" });
    }

    // Crear el nuevo código
    const newCode = new CompanyCode({
      code,
      company: companyId, // Referencia a la empresa
      formationType,
      maxUsers,
      expiresAt,
      auditTrail: [
        {
          action: "created",
          byAdmin: req.user.id,
          details: `Código creado desde el panel para la empresa ${company.name}`
        }
      ]
    });

    await newCode.save();
    res.status(201).json({ message: "Código de empresa creado correctamente", code: newCode });

  } catch (error) {
    console.error("Error al crear código de empresa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener todos los códigos de empresa (solo admins)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const codes = await CompanyCode.find()
      .populate("company", "name") // Muestra nombre de empresa
      .sort({ createdAt: -1 });     // Ordena del más reciente al más antiguo

    res.json(codes);
  } catch (error) {
    console.error("Error al listar códigos de empresa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener códigos por empresa (solo admins)
router.get("/by-company/:companyId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;

    const codes = await CompanyCode.find({ company: companyId })
      .populate("company", "name")
      .sort({ createdAt: -1 });

    res.json(codes);
  } catch (error) {
    console.error("Error al listar códigos por empresa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// PATCH /api/company-codes/deactivate/:id
router.patch("/deactivate/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const code = await CompanyCode.findById(id);
    if (!code) {
      return res.status(404).json({ message: "Código no encontrado" });
    }

    code.active = false;
    await code.save();

    res.json(code);
  } catch (error) {
    console.error("Error al desactivar código:", error);
    res.status(500).json({ message: "Error al desactivar código" });
  }
});

// PATCH /api/company-codes/activate/:id
router.patch("/activate/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const code = await CompanyCode.findById(id);
    if (!code) {
      return res.status(404).json({ message: "Código no encontrado" });
    }

    code.active = true;
    await code.save();

    res.json(code);
  } catch (error) {
    console.error("Error al activar código:", error);
    res.status(500).json({ message: "Error al activar código" });
  }
});

// DELETE /api/company-codes/:id
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CompanyCode.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Código no encontrado" });
    }

    res.json({ message: "Código eliminado correctamente", id });
  } catch (error) {
    console.error("Error al eliminar código:", error);
    res.status(500).json({ message: "Error al eliminar código" });
  }
});

router.get('/admin/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const codes = await CompanyCode.find({ createdByStripe: { $ne: true } })
      .populate('company', 'name') // solo traemos el nombre de la empresa
      .select('code company usedUsers maxUsers users');

    const response = codes.map((code) => ({
      code: code.code,
      company: code.company?.name || 'Sin nombre',
      usedUsers: code.usedUsers,
      maxUsers: code.maxUsers,
      users: code.users.map((u) => ({
        name: u.name,
        email: u.email
      }))
    }));

    res.json(response);
  } catch (err) {
    console.error('❌ Error en /admin/list:', err);
    res.status(500).json({ message: 'Error al obtener los códigos de empresa' });
  }
});

module.exports = router;
