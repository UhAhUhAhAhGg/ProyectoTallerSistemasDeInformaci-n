const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/bd_borrador' });

async function createTestUser() {
  try {
    const email = 'adoptante@test.com';
    const password = 'Test1234!';  // 8+ chars, mayúscula, número, especial
    const hash = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO USUARIOS (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario)
       VALUES (6, $1, $2, 'Adoptante Test', 'User', 'incompleto')
       RETURNING id_usuario, corr_usuario;`,
      [email, hash]
    );
    
    const user = result.rows[0];
    console.log('✅ Usuario adoptante creado exitosamente');
    console.log(`   Email: ${user.corr_usuario}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   ID Usuario: ${user.id_usuario}`);
    
    pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    pool.end();
  }
}

createTestUser();
