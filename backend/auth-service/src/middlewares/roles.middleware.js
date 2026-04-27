// filepath: src/middlewares/roles.middleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de verificación de roles
 * @param {string[]} rolesPermitidos - Array de roles permitidos
 */
function rolesMiddleware(rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.usuario;
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'No autorizado'
      });
    }

    // Normalizar el rol a minúsculas para comparación
    const rolUsuario = usuario.rol?.toLowerCase();
    
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        success: false,
        mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware específico para verificar si es administrador
 */
function adminMiddleware(req, res, next) {
  const usuario = req.usuario;
  
  if (!usuario) {
    return res.status(401).json({
      success: false,
      mensaje: 'No autorizado'
    });
  }

  const rolUsuario = usuario.rol?.toLowerCase();
  
  if (rolUsuario !== 'administrador') {
    return res.status(403).json({
      success: false,
      mensaje: 'Acceso denegado. Se requiere rol de administrador'
    });
  }

  next();
}

module.exports = {
  rolesMiddleware,
  adminMiddleware
};