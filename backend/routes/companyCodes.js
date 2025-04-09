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

module.exports = router;
