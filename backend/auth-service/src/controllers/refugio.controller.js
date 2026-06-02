// filepath: src/controllers/refugio.controller.js
const { 
  guardarDatosRefugio, 
  obtenerDatosRefugio, 
  obtenerRefugiosPendientes,
  obtenerRefugioPorId,
  cambiarEstadoRefugio,
  actualizarDatosRefugio   // ← FALTABA ESTE IMPORT
} = require('../services/refugio.service');

async function guardarDatos(req, res) {
  const id_usuario = req.usuario.id;
  const { nom_refug, dir_refug, telf_refug, licencia_refug, descripcion } = req.body;

  if (!nom_refug || !dir_refug || !telf_refug || !licencia_refug) {
    return res.status(400).json({
      success: false,
      mensaje: 'Todos los campos requeridos deben ser completados'
    });
  }

  try {
    const resultado = await guardarDatosRefugio(id_usuario, {
      nom_refug, dir_refug, telf_refug, licencia_refug, descripcion
    });
    res.json({
      success: true,
      mensaje: 'Datos del refugio guardados. Tu perfil está pendiente de validación.',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({ success: false, mensaje: error.message });
  }
}

async function obtenerDatos(req, res) {
  const id_usuario = req.usuario.id;
  try {
    const refugio = await obtenerDatosRefugio(id_usuario);
    if (!refugio) {
      return res.json({ success: true, data: null, mensaje: 'El usuario no tiene datos de refugio' });
    }
    res.json({ success: true, data: refugio });
  } catch (error) {
    res.status(400).json({ success: false, mensaje: error.message });
  }
}

async function actualizarDatos(req, res) {
  const id_usuario = req.usuario.id;
  const { nom_refug, dir_refug, telf_refug, licencia_refug, descripcion } = req.body;

  if (!nom_refug || !dir_refug || !telf_refug || !licencia_refug) {
    return res.status(400).json({ success: false, mensaje: 'Todos los campos requeridos deben ser completados' });
  }

  try {
    const resultado = await actualizarDatosRefugio(id_usuario, { nom_refug, dir_refug, telf_refug, licencia_refug, descripcion });
    res.json({ success: true, mensaje: 'Datos del refugio actualizados', data: resultado });
  } catch (error) {
    res.status(400).json({ success: false, mensaje: error.message });
  }
}

async function obtenerSolicitudes(req, res) {
  try {
    const refugios = await obtenerRefugiosPendientes();
    res.json({ success: true, data: refugios, count: refugios.length });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener solicitudes' });
  }
}

async function obtenerRefugio(req, res) {
  const { id } = req.params;
  try {
    const refugio = await obtenerRefugioPorId(parseInt(id));
    res.json({ success: true, data: refugio });
  } catch (error) {
    res.status(404).json({ success: false, mensaje: error.message });
  }
}

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
    res.json({ success: true, mensaje: `Refugio ${estado} exitosamente`, data: resultado });
  } catch (error) {
    res.status(400).json({ success: false, mensaje: error.message });
  }
}

module.exports = {
  guardarDatos,
  obtenerDatos,
  actualizarDatos,   // ← FALTABA EN EXPORTS
  obtenerSolicitudes,
  obtenerRefugio,
  cambiarEstado,
};