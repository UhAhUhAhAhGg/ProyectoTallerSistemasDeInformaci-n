// filepath: src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Validación de contraseña: mín 12 chars, mayúscula, número, carácter especial
 */
function validarContrasena(contra) {
  const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{12,}$/;
  return regex.test(contra);
}

/**
 * Registrar usuario general (adoptante o refugio)
 */
async function registrarUsuario(datos) {
  const { correo, contrasena, rol, nombre, apellido } = datos;

  // Verificar que el correo no exista
  const existe = await pool.query(
    'SELECT id_usuario FROM USUARIOS WHERE corr_usuario = $1',
    [correo]
  );
  if (existe.rowCount > 0) {
    throw new Error('El correo ya está registrado');
  }

  // id_rol: 1=administrador, 2=adoptante, 3=refugio
  const id_rol = rol === 'adoptante' ? 2 : 3;

  // Estado inicial según rol
  // adoptante → 'incompleto' hasta que complete perfil
  // refugio   → 'incompleto' hasta que complete perfil organizacional
  const est_usuario = 'incompleto';

  // Hashear contraseña
  const hash = await bcrypt.hash(contrasena, 12);

  // INSERT solo con campos obligatorios, los opcionales quedan null
  const result = await pool.query(
    `INSERT INTO USUARIOS 
      (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_usuario, id_rol, corr_usuario, est_usuario`,
    [id_rol, correo, hash, nombre || '', apellido || '', est_usuario]
  );

  const usuario = result.rows[0];

  // JWT con id, rol y estado para que el frontend sepa a dónde redirigir
  const token = jwt.sign(
    {
      id: usuario.id_usuario,
      rol: rol,
      est: usuario.est_usuario
    },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '7d' }
  );

  return {
    token,
    rol,
    id_usuario: usuario.id_usuario,
    correo: usuario.corr_usuario,
    est_usuario: usuario.est_usuario
  };
}

/**
 * Login de usuario
 */
async function loginUsuario(correo, contrasena) {
  const result = await pool.query(
    `SELECT u.id_usuario, u.id_rol, u.corr_usuario, u.contra_usuario,
            u.nom_usuario, u.apell_usuario, u.est_usuario, r.nom_rol
     FROM USUARIOS u
     JOIN ROLES r ON u.id_rol = r.id_rol
     WHERE u.corr_usuario = $1`,
    [correo]
  );

  if (result.rowCount === 0) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const usuario = result.rows[0];

  const esValida = await bcrypt.compare(contrasena, usuario.contra_usuario);
  if (!esValida) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const nombreRol = usuario.nom_rol.toLowerCase();

  const token = jwt.sign(
    {
      id: usuario.id_usuario,
      rol: nombreRol,
      id_rol: usuario.id_rol,
      est: usuario.est_usuario
    },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '7d' }
  );

  return {
    token,
    rol: nombreRol,
    id_usuario: usuario.id_usuario,
    nombre: usuario.nom_usuario,
    correo: usuario.corr_usuario,
    est_usuario: usuario.est_usuario
  };
}

/**
 * Obtener datos del usuario actual
 */
async function obtenerUsuarioActual(id_usuario) {
  const result = await pool.query(
    `SELECT u.id_usuario, u.id_rol, u.corr_usuario, u.nom_usuario,
            u.apell_usuario, u.est_usuario, r.nom_rol
     FROM USUARIOS u
     JOIN ROLES r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = $1`,
    [id_usuario]
  );

  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado');
  }

  return result.rows[0];
}

module.exports = {
  validarContrasena,
  registrarUsuario,
  loginUsuario,
  obtenerUsuarioActual
};