// filepath: src/controllers/auth.controller.js
const {
  validarContrasena,
  registrarUsuario,
  registrarRefugioCompleto,
  loginUsuario,
  obtenerUsuarioActual
} = require('../services/auth.service');

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
      mensaje: 'Todos los campos son requeridos',
      campos_recibidos: { correo: !!correo, contrasena: !!contrasena, confirmar_contrasena: !!confirmar_contrasena, rol: !!rol }
    });
  }

  // Validar rol
  if (rol !== 'adoptante' && rol !== 'refugio') {
    return res.status(400).json({
      success: false,
      mensaje: `Rol inválido recibido: "${rol}". Debe ser 'adoptante' o 'refugio'`
    });
  }

  if (rol === 'refugio') {
    return res.status(400).json({
      success: false,
      mensaje: 'El registro de refugio debe incluir los datos completos del refugio'
    });
  }

  // Validar contraseña
  if (!validarContrasena(contrasena)) {
    return res.status(400).json({
      success: false,
      mensaje: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*)'
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
    // Exponer el mensaje real del error (incluye errores de PostgreSQL)
    console.error('[REGISTER] Error:', error.message);
    res.status(400).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Registro atomico de refugio
 * POST /api/auth/register/refugio
 */
async function registroRefugio(req, res) {
  const {
    correo,
    contrasena,
    confirmar_contrasena,
    nombre,
    apellido,
    nom_refug,
    dir_refug,
    telf_refug,
    licencia_refug,
    descripcion
  } = req.body;

  const correoLimpio = typeof correo === 'string' ? correo.trim() : '';
  const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
  const apellidoLimpio = typeof apellido === 'string' ? apellido.trim() : '';
  const nomRefugioLimpio = typeof nom_refug === 'string' ? nom_refug.trim() : '';
  const dirRefugioLimpia = typeof dir_refug === 'string' ? dir_refug.trim() : '';
  const telefonoLimpio = typeof telf_refug === 'string' ? telf_refug.trim() : '';
  const licenciaLimpia = typeof licencia_refug === 'string' ? licencia_refug.trim() : '';
  const descripcionLimpia = typeof descripcion === 'string' ? descripcion.trim() : '';

  if (!correoLimpio || !contrasena || !confirmar_contrasena || !nomRefugioLimpio || !dirRefugioLimpia || !telefonoLimpio || !licenciaLimpia) {
    return res.status(400).json({
      success: false,
      mensaje: 'Todos los campos requeridos deben ser completados',
      campos_recibidos: {
        correo: !!correoLimpio,
        contrasena: !!contrasena,
        confirmar_contrasena: !!confirmar_contrasena,
        nom_refug: !!nomRefugioLimpio,
        dir_refug: !!dirRefugioLimpia,
        telf_refug: !!telefonoLimpio,
        licencia_refug: !!licenciaLimpia
      }
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
    return res.status(400).json({
      success: false,
      mensaje: 'El correo electronico no tiene un formato valido'
    });
  }

  const digitosTelefono = telefonoLimpio.replace(/\D/g, '');
  if (!/^[+\d\s()-]+$/.test(telefonoLimpio) || digitosTelefono.length < 7 || digitosTelefono.length > 15) {
    return res.status(400).json({
      success: false,
      mensaje: 'El telefono no tiene un formato valido'
    });
  }

  if (licenciaLimpia.length < 3) {
    return res.status(400).json({
      success: false,
      mensaje: 'La licencia o registro oficial no tiene un formato valido'
    });
  }

  if (!validarContrasena(contrasena)) {
    return res.status(400).json({
      success: false,
      mensaje: 'La contrasena debe tener minimo 8 caracteres, una mayuscula, un numero y un caracter especial (!@#$%^&*)'
    });
  }

  if (contrasena !== confirmar_contrasena) {
    return res.status(400).json({
      success: false,
      mensaje: 'Las contrasenas no coinciden'
    });
  }

  try {
    const resultado = await registrarRefugioCompleto({
      correo: correoLimpio,
      contrasena,
      nombre: nombreLimpio,
      apellido: apellidoLimpio,
      nom_refug: nomRefugioLimpio,
      dir_refug: dirRefugioLimpia,
      telf_refug: telefonoLimpio,
      licencia_refug: licenciaLimpia,
      descripcion: descripcionLimpia
    });

    res.status(201).json({
      success: true,
      mensaje: 'Refugio registrado. Tu perfil esta pendiente de validacion.',
      data: resultado
    });
  } catch (error) {
    console.error('[REGISTER_REFUGIO] Error:', error.message);
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
 * Logout (JWT es stateless)
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.json({
    success: true,
    mensaje: 'Logout exitoso'
  });
}

module.exports = { registro, registroRefugio, login, logout, getCurrentUser };
