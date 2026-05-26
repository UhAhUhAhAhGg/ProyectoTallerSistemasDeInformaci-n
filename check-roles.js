const pg = require('pg');
const pool = new pg.Pool({user: 'postgres', password: 'admin', host: 'localhost', port: 5432, database: 'bd_borrador'});

pool.query('SELECT id_rol, nom_rol FROM roles ORDER BY id_rol;')
  .then(res => {
    console.log('Roles actuales:');
    res.rows.forEach(r => console.log(`  ID ${r.id_rol}: "${r.nom_rol}"`));
    
    // Verificar usuarios y sus roles
    return pool.query('SELECT id_usuario, corr_usuario, id_rol FROM usuarios LIMIT 5;');
  })
  .then(res => {
    console.log('\nPrimeros 5 usuarios:');
    res.rows.forEach(u => console.log(`  ID ${u.id_usuario}: ${u.corr_usuario} (id_rol=${u.id_rol})`));
    pool.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    pool.end();
  });
