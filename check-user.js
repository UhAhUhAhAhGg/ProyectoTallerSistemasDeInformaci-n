const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/bd_borrador' });

pool.query("SELECT id_usuario, corr_usuario, nom_usuario FROM USUARIOS WHERE corr_usuario = 'test@test.com';")
  .then(r => {
    if (r.rowCount > 0) {
      console.log('Usuario encontrado:', r.rows[0]);
    } else {
      console.log('Usuario no encontrado');
    }
    pool.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    pool.end();
  });
