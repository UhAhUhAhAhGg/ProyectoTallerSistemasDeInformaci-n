const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/bd_borrador' });

async function crearDatos() {
  try {
    // 1. Crear una mascota
    const petRes = await pool.query(
      `INSERT INTO MASCOTAS (id_raza, img_mascot, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
       VALUES (1, 'test-dog.jpg', 'Firulais', 3, NOW() - INTERVAL '3 years', 'Perro amigable y sociable', true, false)
       RETURNING id_mascot;`
    );
    const id_mascot = petRes.rows[0].id_mascot;
    console.log('✅ Mascota creada:', id_mascot);

    // 2. Crear una publicación de adopción
    const pubRes = await pool.query(
      `INSERT INTO PUBLICACIONES (id_mascot, id_refug, arch_publi, decrip_publi, est_publi, est_adop)
       VALUES ($1, 2, 'test.pdf', 'Hermoso perro disponible para adopción', true, true)
       RETURNING id_publi;`,
      [id_mascot]
    );
    const id_publi = pubRes.rows[0].id_publi;
    console.log('✅ Publicación creada:', id_publi);

    // 3. Crear una solicitud de adopción (por el adoptante id_usuario 2)
    const soliRes = await pool.query(
      `INSERT INTO SOLI_ADOP (id_usuario, id_publi, id_est, decrip_soli, fech_soli)
       VALUES (2, $1, 1, 'Quiero adoptar a Firulais, tengo experiencia con perros', NOW())
       RETURNING id_soli;`,
      [id_publi]
    );
    const id_soli = soliRes.rows[0].id_soli;
    console.log('✅ Solicitud de adopción creada:', id_soli);

    console.log('\n✅ Datos de prueba creados exitosamente');
    console.log(`   - Mascota ID: ${id_mascot}`);
    console.log(`   - Publicación ID: ${id_publi}`);
    console.log(`   - Solicitud ID: ${id_soli}`);
    console.log('   - Refugio ID: 2 (Usuario 7)');
    console.log('   - Adoptante ID: 2 (Usuario 2)');

    pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    pool.end();
  }
}

crearDatos();
