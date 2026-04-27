// filepath: src/controllers/perfil.controller.js
const { guardarPerfilAdoptante, obtenerPerfilAdoptante, obtenerEspecies } = require('../services/perfil.service');

/**
 * Guardar perfil del adoptante
 * POST /api/perfil-adoptante
 */
async function guardarPerfil(req, res) {
  const id_usuario = req.usuario.id;
  
  const { 
    tipo_vivienda, 
    tiene_patio, 
    disp_tiempo, 
    exp_previa, 
    desc_exp,
    pref_especie,
    pref_tamanio,
    pref_edad,
    acepta_ninos,
    acepta_otros
  } = req.body;

  // Validar campos requeridos
  if (!tipo_vivienda || !disp_tiempo || acepta_ninos === undefined || acepta_otros === undefined) {
    return res.status(400).json({
      success: false,
      mensaje: 'Todos los campos requeridos deben ser completados'
    });
  }

  try {
    const perfil = await guardarPerfilAdoptante(id_usuario, {
      tipo_vivienda,
      tiene_patio: tiene_patio || false,
      disp_tiempo,
      exp_previa: exp_previa || false,
      desc_exp,
      pref_especie,
      pref_tamanio,
      pref_edad,
      acepta_ninos,
      acepta_otros
    });

    res.json({
      success: true,
      mensaje: 'Perfil guardado exitosamente',
      data: perfil
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Obtener perfil del adoptante
 * GET /api/perfil-adoptante
 */
async function obtenerPerfil(req, res) {
  const id_usuario = req.usuario.id;

  try {
    const perfil = await obtenerPerfilAdoptante(id_usuario);
    
    if (!perfil) {
      return res.json({
        success: true,
        data: null,
        mensaje: 'El usuario no tiene perfil completado'
      });
    }

    res.json({
      success: true,
      data: perfil
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      mensaje: error.message
    });
  }
}

/**
 * Obtener especies para selectores
 * GET /api/perfil-adoptante/especies
 */
async function obtenerEspeciesHandler(req, res) {
  try {
    const especies = await obtenerEspecies();
    res.json({
      success: true,
      data: especies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener especies'
    });
  }
}

module.exports = {
  guardarPerfil,
  obtenerPerfil,
  obtenerEspeciesHandler
};