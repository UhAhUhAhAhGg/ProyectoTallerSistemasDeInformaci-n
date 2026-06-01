const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/bd_borrador' });

pool.query(
  "INSERT INTO REFUGIOS (id_usuario, nom_refug, dir_refug, telf_refug, licencia_refug, est_aprobacion) VALUES (7, 'Refugio Test', 'Calle Principal 123', '2-444-5555', 'LIC-2024-001', 'activo') RETURNING id_refug, id_usuario;"
)
  .then(r => {
    console.log('✅ Refugio creado para usuario 7:', r.rows[0]);
    pool.end();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    pool.end();
  });
