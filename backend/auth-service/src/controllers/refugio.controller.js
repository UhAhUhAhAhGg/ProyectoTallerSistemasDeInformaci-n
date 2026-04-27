// filepath: src/controllers/refugio.controller.js
const { 
  guardarDatosRefugio, 
  obtenerDatosRefugio, 
  obtenerRefugiosPendientes,
  obtenerRefugioPorId,
  cambiarEstadoRefugio 
} = require('../services/refugio.service');

/**
 * Guardar datos del refugio
 * POST /api/refugios/datos
 */
async function guardarDatos(req, res) {
  const id_usuario = req.usuario.id;
  
  // ✅ CORREGIDO: eliminado corr_refug ya que el correo está en USUARIOS
  const { nom_refug, dir_refug, telf_refug, licencia_refug, descripcion } = req.body;

  // ✅ CORREGIDO: eliminado corr_refug de la validación
  if (!nom_refug || !dir_refug || !telf_refug || !licencia_refug) {
    return res.status(400).json({
      success: false,
      mensaje: 'Todos los campos requeridos deben ser completados'
    });
  }

  try {
    const resultado = await guardarDatosRefugio(id_usuario, {
      nom_refug,
      dir_refug,
      telf_refug,
      licencia_refug,
      descripcion
    });

    res.json({
      success: true,
      mensaje: 'Datos del refugio guardados. Tu perfil está pendiente de validación.',
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
 * Obtener datos del refugio
 * GET /api/refugios/datos
 */
async function obtenerDatos(req, res) {
  const id_usuario = req.usuario.id;

  try {
    const refugio = await obtenerDatosRefugio(id_usuario);
    
    if (!refugio) {
      return res.json({
        success: true,
        data: null,
        mensaje: 'El usuario no tiene datos de refugio'
      });
    }

    res.json({
      success: true,
      data: refugio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Obtener refugios pendientes (solo admin)
 * GET /api/refugios/admin/solicitudes
 */
async function obtenerSolicitudes(req, res) {
  try {
    const refugios = await obtenerRefugiosPendientes();
    res.json({
      success: true,
      data: refugios,
      count: refugios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener solicitudes'
    });
  }
}

/**
 * Obtener refugio por ID (solo admin)
 * GET /api/refugios/admin/refugio/:id
 */
async function obtenerRefugio(req, res) {
  const { id } = req.params;

  try {
    const refugio = await obtenerRefugioPorId(parseInt(id));
    res.json({
      success: true,
      data: refugio
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Cambiar estado del refugio (solo admin)
 * PATCH /api/refugios/admin/refugio/:id/estado
 */
async function cambiarEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado || !['aprobado', 'rechazado'].includes(estado)) {
    return res.status(400).json({
      success: false,
      mensaje: 'Estado inválido. Debe ser "aprobado" o "rechazado"'
    });
  }

  try {
    const resultado = await cambiarEstadoRefugio(parseInt(id), estado);
    res.json({
      success: true,
      mensaje: `Refugio ${estado} exitosamente`,
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      mensaje: error.message
    });
  }
}

module.exports = {
  guardarDatos,
  obtenerDatos,
  obtenerSolicitudes,
  obtenerRefugio,
  cambiarEstado
};