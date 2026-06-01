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

const crypto = require('crypto');

/**
 * HU-05: Solicitar recuperación de contraseña
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ success: false, mensaje: 'El correo es requerido' });
  }

  try {
    // Verificar que el usuario existe (no revelar si existe o no por seguridad)
    const result = await pool.query(
      'SELECT id_usuario, nom_usuario FROM USUARIOS WHERE corr_usuario = $1',
      [correo.trim().toLowerCase()]
    );

    if (result.rowCount === 0) {
      // Respuesta genérica para no revelar si el correo existe
      return res.json({
        success: true,
        mensaje: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
        // En producción NO devolver el token aquí. Solo en desarrollo:
        ...(process.env.NODE_ENV === 'development' ? { dev_token: null } : {})
      });
    }

    const usuario = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en tabla (crear si no existe)
    await pool.query(
      `INSERT INTO PASSWORD_RESET_TOKENS (id_usuario, token, expira_en, usado)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (id_usuario) DO UPDATE
       SET token = $2, expira_en = $3, usado = false`,
      [usuario.id_usuario, token, expira]
    );

    return res.json({
      success: true,
      mensaje: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
      // En desarrollo mostramos el token directamente (sin email service):
      ...(process.env.NODE_ENV === 'development' ? {
        dev_nota: 'SOLO EN DESARROLLO: en producción este token se envía por correo',
        dev_token: token,
        dev_usuario: usuario.nom_usuario,
        dev_correo: correo
      } : {})
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD] Error:', error.message);
    return res.status(500).json({ success: false, mensaje: 'Error al procesar la solicitud' });
  }
}

/**
 * HU-05: Restablecer contraseña con token
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
  const { token, nueva_contrasena, confirmar_contrasena } = req.body;

  if (!token || !nueva_contrasena || !confirmar_contrasena) {
    return res.status(400).json({ success: false, mensaje: 'Token, nueva contraseña y confirmación son requeridos' });
  }

  if (nueva_contrasena !== confirmar_contrasena) {
    return res.status(400).json({ success: false, mensaje: 'Las contraseñas no coinciden' });
  }

  if (!validarContrasena(nueva_contrasena)) {
    return res.status(400).json({
      success: false,
      mensaje: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*)'
    });
  }

  try {
    const result = await pool.query(
      `SELECT prt.id_usuario, prt.expira_en, prt.usado
       FROM PASSWORD_RESET_TOKENS prt
       WHERE prt.token = $1`,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, mensaje: 'Token inválido o expirado' });
    }

    const registro = result.rows[0];

    if (registro.usado) {
      return res.status(400).json({ success: false, mensaje: 'Este token ya fue utilizado' });
    }

    if (new Date() > new Date(registro.expira_en)) {
      return res.status(400).json({ success: false, mensaje: 'El token ha expirado. Solicita uno nuevo.' });
    }

    const hash = await bcrypt.hash(nueva_contrasena, 12);

    await pool.query(
      'UPDATE USUARIOS SET contra_usuario = $1 WHERE id_usuario = $2',
      [hash, registro.id_usuario]
    );

    await pool.query(
      'UPDATE PASSWORD_RESET_TOKENS SET usado = true WHERE token = $1',
      [token]
    );

    return res.json({ success: true, mensaje: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('[RESET_PASSWORD] Error:', error.message);
    return res.status(500).json({ success: false, mensaje: 'Error al restablecer la contraseña' });
  }
}