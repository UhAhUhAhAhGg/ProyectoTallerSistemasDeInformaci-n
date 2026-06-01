// filepath: backend/auth-service/src/services/refugio.service.js
const pool = require('../config/db');
const jwt  = require('jsonwebtoken');

/**
 * Guardar perfil del refugio.
 * Devuelve también un token JWT actualizado con id_refug.
 */
async function guardarDatosRefugio(id_usuario, datos) {
  // Verificar que el usuario sea de rol refugio
  const usuario = await pool.query(
    'SELECT id_rol FROM USUARIOS WHERE id_usuario = $1',
    [id_usuario]
  );

  if (Number(usuario.rows[0]?.id_rol) !== 3) {
    throw new Error('No autorizado: el usuario no es refugio');
  }

  // ¿Ya tiene perfil de refugio?
  const existente = await pool.query(
    'SELECT id_refug FROM REFUGIOS WHERE id_usuario = $1',
    [id_usuario]
  );

  let refugio;

  if (existente.rowCount > 0) {
    const result = await pool.query(
      `UPDATE REFUGIOS
       SET nom_refug = $1, dir_refug = $2, telf_refug = $3,
           licencia_refug = $4, descripcion = $5, est_aprobacion = 'pendiente'
       WHERE id_usuario = $6
       RETURNING *`,
      [
        datos.nom_refug,
        datos.dir_refug,
        datos.telf_refug,
        datos.licencia_refug,
        datos.descripcion || null,
        id_usuario
      ]
    );
    refugio = result.rows[0];
  } else {
    const result = await pool.query(
      `INSERT INTO REFUGIOS
        (id_usuario, nom_refug, dir_refug, telf_refug, licencia_refug, descripcion, est_aprobacion)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
       RETURNING *`,
      [
        id_usuario,
        datos.nom_refug,
        datos.dir_refug,
        datos.telf_refug,
        datos.licencia_refug,
        datos.descripcion || null
      ]
    );
    refugio = result.rows[0];
  }

  // Estado del usuario → 'pendiente'
  await pool.query(
    `UPDATE USUARIOS SET est_usuario = 'pendiente' WHERE id_usuario = $1`,
    [id_usuario]
  );

  // Notificar al admin
  const admin = await pool.query(
    `SELECT id_usuario FROM USUARIOS WHERE id_rol = 5 LIMIT 1`
  );

  if (admin.rowCount > 0) {
    await pool.query(
      `INSERT INTO NOTIFICACIONES
        (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        admin.rows[0].id_usuario,
        'solicitud_refugio',
        'Nuevo refugio pendiente de aprobación',
        `El refugio "${datos.nom_refug}" completó su perfil y espera validación.`,
        refugio.id_refug
      ]
    );
  }

  // ✅ Generar token nuevo con id_refug
  const token = jwt.sign(
    {
      id: id_usuario,
      rol: 'refugio',
      id_rol: 3,
      est: 'pendiente',
      id_refug: refugio.id_refug,
    },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '7d' }
  );

  return {
    id_refug: refugio.id_refug,
    nom_refug: refugio.nom_refug,
    est_aprobacion: refugio.est_aprobacion,
    token, // ← nuevo
    mensaje: 'Tu refugio está pendiente de validación por un administrador'
  };
}

async function obtenerDatosRefugio(id_usuario) {
  const result = await pool.query(
    `SELECT r.*, u.corr_usuario
     FROM REFUGIOS r
     JOIN USUARIOS u ON r.id_usuario = u.id_usuario
     WHERE r.id_usuario = $1`,
    [id_usuario]
  );
  return result.rowCount === 0 ? null : result.rows[0];
}

/**
 * Lista TODOS los refugios para el panel admin (no solo pendientes).
 * El frontend filtra por estado en cliente.
 */
async function obtenerRefugiosPendientes() {
  const result = await pool.query(
    `SELECT r.id_refug, r.nom_refug, r.dir_refug, r.telf_refug,
            r.licencia_refug, r.est_aprobacion, r.fecha_solicitud,
            u.id_usuario, u.nom_usuario, u.apell_usuario, u.corr_usuario
     FROM REFUGIOS r
     JOIN USUARIOS u ON r.id_usuario = u.id_usuario
     ORDER BY 
       CASE r.est_aprobacion 
         WHEN 'pendiente' THEN 1 
         WHEN 'aprobado'  THEN 2 
         ELSE 3 
       END,
       r.fecha_solicitud DESC`
  );
  return result.rows;
}

async function obtenerRefugioPorId(id_refug) {
  const result = await pool.query(
    `SELECT r.*, u.id_usuario, u.nom_usuario, u.apell_usuario, u.corr_usuario
     FROM REFUGIOS r
     JOIN USUARIOS u ON r.id_usuario = u.id_usuario
     WHERE r.id_refug = $1`,
    [id_refug]
  );
  if (result.rowCount === 0) throw new Error('Refugio no encontrado');
  return result.rows[0];
}

async function cambiarEstadoRefugio(id_refug, nuevo_estado) {
  if (!['aprobado', 'rechazado'].includes(nuevo_estado)) {
    throw new Error('Estado inválido');
  }

  const result = await pool.query(
    `UPDATE REFUGIOS SET est_aprobacion = $1 WHERE id_refug = $2 RETURNING *`,
    [nuevo_estado, id_refug]
  );
  if (result.rowCount === 0) throw new Error('Refugio no encontrado');

  const refugio = result.rows[0];
  const est_usuario = nuevo_estado === 'aprobado' ? 'activo' : 'rechazado';

  if (nuevo_estado === 'rechazado') {
    await pool.query(
      `UPDATE USUARIOS SET est_usuario = $1, id_rol = 6 WHERE id_usuario = $2`,
      [est_usuario, refugio.id_usuario]
    );
  } else {
    await pool.query(
      `UPDATE USUARIOS SET est_usuario = $1 WHERE id_usuario = $2`,
      [est_usuario, refugio.id_usuario]
    );
  }

  const titulo = nuevo_estado === 'aprobado'
    ? '¡Tu refugio ha sido aprobado!'
    : 'Tu solicitud de refugio fue rechazada';
  const cuerpo = nuevo_estado === 'aprobado'
    ? 'Tu refugio fue aprobado. Ya puedes publicar mascotas.'
    : 'Tu solicitud fue rechazada. Contacta al administrador para más información.';

  await pool.query(
    `INSERT INTO NOTIFICACIONES
      (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [refugio.id_usuario, 'estado_refugio', titulo, cuerpo, id_refug]
  );

  return refugio;
}

module.exports = {
  guardarDatosRefugio,
  obtenerDatosRefugio,
  obtenerRefugiosPendientes,
  obtenerRefugioPorId,
  cambiarEstadoRefugio
};