const pool = require('./db');

const _cache = {};

async function getRolId(nombre) {
  if (_cache[nombre]) return _cache[nombre];
  const { rows } = await pool.query(
    'SELECT id_rol FROM ROLES WHERE LOWER(nom_rol) = LOWER($1)',
    [nombre]
  );
  if (!rows[0]) throw new Error(`Rol "${nombre}" no existe en la base de datos`);
  _cache[nombre] = rows[0].id_rol;
  return rows[0].id_rol;
}

module.exports = { getRolId };