// filepath: src/controllers/auth.controller.js
const { validarContrasena, registrarUsuario, loginUsuario, obtenerUsuarioActual } = require('../services/auth.service');

/**
 * Registro de usuario general
 * POST /api/auth/register
 */
async function registro(req, res) {
  const { correo, contrasena, confirmar_contrasena, rol, nombre, apellido } = req.body;

  // Validar campos requeridos
  if (!correo || !contrasena || !confirmar_contrasena || !rol) {
    return res.status(400).json({
      success: false,
      mensaje: 'Todos los campos son requeridos'
    });
  }

  // Validar rol
  if (rol !== 'adoptante' && rol !== 'refugio') {
    return res.status(400).json({
      success: false,
      mensaje: 'El rol debe ser adoptante o refugio'
    });
  }

  // Validar contraseña
  if (!validarContrasena(contrasena)) {
    return res.status(400).json({
      success: false,
      mensaje: 'La contraseña debe tener mínimo 12 caracteres, una mayúscula, un número y un carácter especial'
    });
  }

  // Validar que contraseñas coincidan
  if (contrasena !== confirmar_contrasena) {
    return res.status(400).json({
      success: false,
      mensaje: 'Las contraseñas no coinciden'
    });
  }

  try {
    const resultado = await registrarUsuario({ correo, contrasena, rol, nombre, apellido });
    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Login de usuario
 * POST /api/auth/login
 */
async function login(req, res) {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      success: false,
      mensaje: 'Correo y contraseña son requeridos'
    });
  }

  try {
    const resultado = await loginUsuario(correo, contrasena);
    res.json({
      success: true,
      mensaje: 'Login exitoso',
      data: resultado
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Obtener usuario actual
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  const id_usuario = req.usuario?.id;
  
  if (!id_usuario) {
    return res.status(401).json({
      success: false,
      mensaje: 'No autorizado'
    });
  }

  try {
    const usuario = await obtenerUsuarioActual(id_usuario);
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Logout (placeholder - JWT es stateless)
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.json({
    success: true,
    mensaje: 'Logout exitoso'
  });
}

module.exports = {
  registro,
  login,
  logout,
  getCurrentUser
};
