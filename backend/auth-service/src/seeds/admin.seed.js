require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { getRolId } = require('../config/roles');

async function seedAdmin() {
  try {
    const idAdmin = await getRolId('administrador');
    const correo = 'admin@petmatch.com';
    const hash = await bcrypt.hash('Admin123456!', 12);

    await pool.query(
      `INSERT INTO USUARIOS
        (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (corr_usuario) DO NOTHING`,
      [idAdmin, correo, hash, 'Admin', 'Sistema', 'activo']
    );

    console.log('Admin creado: admin@petmatch.com / Admin123456!');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  }
}

seedAdmin();