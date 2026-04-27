// filepath: src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      mensaje: 'Sin token de autenticación'
    });
  }

  // El formato debe ser "Bearer <token>"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      mensaje: 'Token malformado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      mensaje: 'Token inválido o expirado'
    });
  }
}

module.exports = authMiddleware;