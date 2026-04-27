// filepath: src/services/notificacion.service.js
const pool = require('../config/db');

/**
 * Obtener notificaciones de un usuario
 */
async function getNotificaciones(id_usuario) {
  const result = await pool.query(
    `SELECT * FROM NOTIFICACIONES 
     WHERE id_usuario = $1 
     ORDER BY fech_notif DESC`,
    [id_usuario]
  );
  return result.rows;
}

/**
 * Obtener notificaciones no leídas de un usuario
 */
async function getNotificacionesNoLeidas(id_usuario) {
  const result = await pool.query(
    `SELECT * FROM NOTIFICACIONES 
     WHERE id_usuario = $1 AND leida = false 
     ORDER BY fech_notif DESC`,
    [id_usuario]
  );
  return result.rows;
}

/**
 * Marcar notificación como leída
 */
async function marcarComoLeida(id_notif, id_usuario) {
  const result = await pool.query(
    `UPDATE NOTIFICACIONES 
     SET leida = true 
     WHERE id_notif = $1 AND id_usuario = $2 
     RETURNING *`,
    [id_notif, id_usuario]
  );
  
  if (result.rowCount === 0) {
    throw new Error('Notificación no encontrada');
  }
  
  return result.rows[0];
}

/**
 * Marcar todas las notificaciones como leídas
 */
async function marcarTodasComoLeidas(id_usuario) {
  const result = await pool.query(
    `UPDATE NOTIFICACIONES 
     SET leida = true 
     WHERE id_usuario = $1 AND leida = false 
     RETURNING *`,
    [id_usuario]
  );
  
  return result.rowCount;
}

/**
 * Crear una notificación
 */
async function crearNotificacion(id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id = null) {
  const result = await pool.query(
    `INSERT INTO NOTIFICACIONES 
      (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id]
  );
  
  return result.rows[0];
}

/**
 * Eliminar una notificación
 */
async function eliminarNotificacion(id_notif, id_usuario) {
  const result = await pool.query(
    `DELETE FROM NOTIFICACIONES 
     WHERE id_notif = $1 AND id_usuario = $2 
     RETURNING *`,
    [id_notif, id_usuario]
  );
  
  if (result.rowCount === 0) {
    throw new Error('Notificación no encontrada');
  }
  
  return result.rows[0];
}

module.exports = {
  getNotificaciones,
  getNotificacionesNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  crearNotificacion,
  eliminarNotificacion
};