// filepath: src/controllers/notificacion.controller.js
const { 
  getNotificaciones, 
  getNotificacionesNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion
} = require('../services/notificacion.service');

/**
 * Obtener todas las notificaciones del usuario
 * GET /api/notificaciones
 */
async function obtenerNotificaciones(req, res) {
  const id_usuario = req.usuario.id;
  
  try {
    const notificaciones = await getNotificaciones(id_usuario);
    res.json({
      success: true,
      data: notificaciones,
      count: notificaciones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener notificaciones'
    });
  }
}

/**
 * Obtener notificaciones no leídas
 * GET /api/notificaciones/no-leidas
 */
async function obtenerNoLeidas(req, res) {
  const id_usuario = req.usuario.id;
  
  try {
    const notificaciones = await getNotificacionesNoLeidas(id_usuario);
    res.json({
      success: true,
      data: notificaciones,
      count: notificaciones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener notificaciones'
    });
  }
}

/**
 * Marcar notificación como leída
 * PATCH /api/notificaciones/:id/leida
 */
async function marcarLeida(req, res) {
  const { id } = req.params;
  const id_usuario = req.usuario.id;
  
  try {
    const resultado = await marcarComoLeida(parseInt(id), id_usuario);
    res.json({
      success: true,
      mensaje: 'Notificación marcada como leída',
      data: resultado
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Marcar todas las notificaciones como leídas
 * PATCH /api/notificaciones/leer-todas
 */
async function marcarTodasLeidas(req, res) {
  const id_usuario = req.usuario.id;
  
  try {
    const count = await marcarTodasComoLeidas(id_usuario);
    res.json({
      success: true,
      mensaje: `${count} notificaciones marcadas como leídas`,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al marcar notificaciones'
    });
  }
}

/**
 * Eliminar una notificación
 * DELETE /api/notificaciones/:id
 */
async function eliminarNotif(req, res) {
  const { id } = req.params;
  const id_usuario = req.usuario.id;
  
  try {
    await eliminarNotificacion(parseInt(id), id_usuario);
    res.json({
      success: true,
      mensaje: 'Notificación eliminada'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      mensaje: error.message
    });
  }
}

module.exports = {
  obtenerNotificaciones,
  obtenerNoLeidas,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotif
};