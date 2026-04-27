// filepath: src/seeds/admin.seed.js
require("dotenv").config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedAdmin() {
  try {
    const correo = 'admin@petmatch.com';
    const contraPlana = 'Admin123456!';
    const hash = await bcrypt.hash(contraPlana, 12);

    // id_rol = 1 → administrador
    // est_usuario = 'activo' porque el admin no necesita completar perfil
    await pool.query(
      `INSERT INTO USUARIOS
        (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (corr_usuario) DO NOTHING`,
      [1, correo, hash, 'Admin', 'Sistema', 'activo']
    );

    console.log('✅ Admin creado exitosamente');
    console.log('   Correo:     admin@petmatch.com');
    console.log('   Contraseña: Admin123456!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear admin:', error);
    process.exit(1);
  }
}

seedAdmin();