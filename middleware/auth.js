// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Extraer el token del header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Falta token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar los datos del usuario en la petición
    req.user = decoded;

    // Continuar al siguiente middleware o controlador
    next();
  } catch (err) {
    console.error('Error al verificar token:', err);
    return res.status(403).json({ error: 'Token inválido' });
  }
};
