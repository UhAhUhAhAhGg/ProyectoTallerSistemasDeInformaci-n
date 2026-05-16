// filepath: src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Validación de contraseña: mín 8 chars, mayúscula, número, carácter especial
 */
function validarContrasena(contra) {
  const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(contra);
}

async function notificarAdministradoresNuevoRegistro(usuario, rol) {
  const admins = await pool.query(
    'SELECT id_usuario FROM USUARIOS WHERE id_rol = 1'
  );

  if (admins.rowCount === 0) return;

  const nombre = [usuario.nom_usuario, usuario.apell_usuario].filter(Boolean).join(' ').trim();
  const titulo = rol === 'refugio'
    ? 'Nuevo refugio registrado'
    : 'Nuevo adoptante registrado';
  const cuerpo = `${nombre || usuario.corr_usuario} se registro como ${rol}.`;

  await Promise.all(
    admins.rows.map((admin) =>
      pool.query(
        `INSERT INTO NOTIFICACIONES
          (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [admin.id_usuario, `registro_${rol}`, titulo, cuerpo, usuario.id_usuario]
      )
    )
  );
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
  const est_usuario = 'incompleto';

  // Hashear contraseña
  const hash = await bcrypt.hash(contrasena, 12);

  // INSERT solo con campos obligatorios
  const result = await pool.query(
    `INSERT INTO USUARIOS 
      (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_usuario, id_rol, corr_usuario, nom_usuario, apell_usuario, est_usuario`,
    [id_rol, correo, hash, nombre || '', apellido || '', est_usuario]
  );

  const usuario = result.rows[0];

  if (rol === 'adoptante') {
    await notificarAdministradoresNuevoRegistro(usuario, rol);
  }

  const token = jwt.sign(
    {
      id: usuario.id_usuario,
      rol: rol,
      est: usuario.est_usuario,
      id_refug: null  // recién registrado, aún no tiene refugio
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
 * Registrar cuenta de refugio y perfil en una sola transaccion.
 * Si cualquier paso falla, no se crea ni el usuario ni el refugio.
 */
async function registrarRefugioCompleto(datos) {
  const {
    correo,
    contrasena,
    nombre,
    apellido,
    nom_refug,
    dir_refug,
    telf_refug,
    licencia_refug,
    descripcion
  } = datos;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existe = await client.query(
      'SELECT id_usuario FROM USUARIOS WHERE corr_usuario = $1',
      [correo]
    );
    if (existe.rowCount > 0) {
      throw new Error('El correo ya esta registrado');
    }

    const hash = await bcrypt.hash(contrasena, 12);

    const usuarioResult = await client.query(
      `INSERT INTO USUARIOS
        (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_usuario, id_rol, corr_usuario, nom_usuario, apell_usuario, est_usuario`,
      [3, correo, hash, nombre || nom_refug, apellido || '-', 'pendiente']
    );

    const usuario = usuarioResult.rows[0];

    const refugioResult = await client.query(
      `INSERT INTO REFUGIOS
        (id_usuario, nom_refug, dir_refug, telf_refug, licencia_refug, descripcion, est_aprobacion)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
       RETURNING *`,
      [
        usuario.id_usuario,
        nom_refug,
        dir_refug,
        telf_refug,
        licencia_refug,
        descripcion || null
      ]
    );

    const refugio = refugioResult.rows[0];

    const admins = await client.query(
      'SELECT id_usuario FROM USUARIOS WHERE id_rol = 1'
    );

    for (const admin of admins.rows) {
      await client.query(
        `INSERT INTO NOTIFICACIONES
          (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          admin.id_usuario,
          'solicitud_refugio',
          'Nuevo refugio pendiente de aprobacion',
          `El refugio "${nom_refug}" completo su perfil y espera validacion.`,
          refugio.id_refug
        ]
      );
    }

    await client.query('COMMIT');

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol: 'refugio',
        id_rol: 3,
        est: 'pendiente',
        id_refug: refugio.id_refug
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    return {
      token,
      rol: 'refugio',
      id_usuario: usuario.id_usuario,
      correo: usuario.corr_usuario,
      est_usuario: usuario.est_usuario,
      id_refug: refugio.id_refug,
      est_aprobacion: refugio.est_aprobacion
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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

  // ✅ NUEVO: bloqueo de cuenta por administrador
  if (usuario.est_usuario === 'bloqueado') {
    throw new Error('Tu cuenta ha sido bloqueada por un administrador. Contacta a admin@petmatch.com');
  }

  if (usuario.est_usuario === 'rechazado') {
     throw new Error('Tu solicitud fue rechazada. Contacta al administrador.');
 }

  const nombreRol = usuario.nom_rol.toLowerCase();

  // Si es refugio, buscar su id_refug para incluirlo en el token
  let id_refug = null;
  if (nombreRol === 'refugio') {
    const refResult = await pool.query(
      'SELECT id_refug FROM REFUGIOS WHERE id_usuario = $1',
      [usuario.id_usuario]
    );
    if (refResult.rowCount > 0) {
      id_refug = refResult.rows[0].id_refug;
    }
  }

  const token = jwt.sign(
    {
      id: usuario.id_usuario,
      rol: nombreRol,
      id_rol: usuario.id_rol,
      est: usuario.est_usuario,
      id_refug  // null si es adoptante/admin, número si es refugio
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
    est_usuario: usuario.est_usuario,
    id_refug
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
  registrarRefugioCompleto,
  loginUsuario,
  obtenerUsuarioActual
};
