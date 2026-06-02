const pool = require('../config/db');
const { getRolId } = require('../config/roles');

async function guardarPerfilAdoptante(id_usuario, datos) {
  const idRolAdoptante = await getRolId('adoptante');

  const usuario = await pool.query(
    'SELECT id_rol FROM USUARIOS WHERE id_usuario = $1',
    [id_usuario]
  );
  if (Number(usuario.rows[0]?.id_rol) !== idRolAdoptante) {
    throw new Error('No autorizado: el usuario no es adoptante');
  }

  const result = await pool.query(
    `INSERT INTO PERFIL_ADOPTANTE 
      (id_usuario, tipo_vivienda, tiene_patio, disp_tiempo, exp_previa,
       desc_exp, pref_especie, pref_tamanio, pref_edad, acepta_ninos, acepta_otros)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (id_usuario) DO UPDATE SET
       tipo_vivienda = EXCLUDED.tipo_vivienda,
       tiene_patio   = EXCLUDED.tiene_patio,
       disp_tiempo   = EXCLUDED.disp_tiempo,
       exp_previa    = EXCLUDED.exp_previa,
       desc_exp      = EXCLUDED.desc_exp,
       pref_especie  = EXCLUDED.pref_especie,
       pref_tamanio  = EXCLUDED.pref_tamanio,
       pref_edad     = EXCLUDED.pref_edad,
       acepta_ninos  = EXCLUDED.acepta_ninos,
       acepta_otros  = EXCLUDED.acepta_otros
     RETURNING *`,
    [
      id_usuario,
      datos.tipo_vivienda,
      datos.tiene_patio,
      datos.disp_tiempo,
      datos.exp_previa,
      datos.desc_exp || null,
      datos.pref_especie || null,
      datos.pref_tamanio || null,
      datos.pref_edad || null,
      datos.acepta_ninos,
      datos.acepta_otros
    ]
  );

  await pool.query(
    `UPDATE USUARIOS
     SET est_usuario = 'activo'
     WHERE id_usuario = $1 AND est_usuario = 'incompleto'`,
    [id_usuario]
  );

  return result.rows[0];
}

async function obtenerPerfilAdoptante(id_usuario) {
  const result = await pool.query(
    `SELECT pa.*, e.nom_espe as pref_especie_nombre
     FROM PERFIL_ADOPTANTE pa
     LEFT JOIN ESPECIES e ON pa.pref_especie = e.id_espe
     WHERE pa.id_usuario = $1`,
    [id_usuario]
  );
  return result.rowCount === 0 ? null : result.rows[0];
}

async function obtenerEspecies() {
  const result = await pool.query(
    'SELECT id_espe, nom_espe FROM ESPECIES ORDER BY nom_espe'
  );
  return result.rows;
}

module.exports = {
  guardarPerfilAdoptante,
  obtenerPerfilAdoptante,
  obtenerEspecies
};