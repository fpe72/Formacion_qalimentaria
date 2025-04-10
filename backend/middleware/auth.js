const jwt = require("jsonwebtoken");

// Middleware: verifica token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Falta token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error al verificar token:", err);
    return res.status(403).json({ error: "Token inválido" });
  }
};

// Middleware: verifica si es admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso solo para administradores" });
  }
  next();
};

// 👇 Exportación compatible: por defecto + por nombre
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;
