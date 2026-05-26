const pg = require('pg');
const pool = new pg.Pool({user: 'postgres', password: 'admin', host: 'localhost', port: 5432, database: 'bd_borrador'});

async function fixRoles() {
  try {
    console.log('🔧 Consolidando roles...\n');
    
    // 1. Actualizar roles a valores correctos (mantener solo ID 5,6,7 con nombres correctos)
    await pool.query("UPDATE roles SET nom_rol = 'administrador' WHERE id_rol = 1;");
    console.log('✅ ID 1: Superadmin → administrador');
    
    // 2. Actualizar usuarios que tenían roles viejos al nuevo rol correcto
    // Si tenían "Administrador Refugio" o "Trabajador Refugio" → cambiar a "refugio" (ID 7)
    await pool.query("UPDATE usuarios SET id_rol = 7 WHERE id_rol IN (2, 3);");
    console.log('✅ Usuarios con roles 2,3 actualizados a rol 7 (refugio)');
    
    // 3. Cambiar usuarios que tenían rol 4 (Adoptante) a rol 6
    await pool.query("UPDATE usuarios SET id_rol = 6 WHERE id_rol = 4;");
    console.log('✅ Usuarios con rol 4 actualizados a rol 6 (adoptante)');
    
    // 4. Eliminar roles duplicados/innecesarios
    await pool.query("DELETE FROM roles WHERE id_rol IN (2, 3, 4);");
    console.log('✅ Roles duplicados (2,3,4) eliminados');
    
    // 5. Verificar roles finales
    const result = await pool.query('SELECT id_rol, nom_rol FROM roles ORDER BY id_rol;');
    console.log('\n📋 Roles finales:');
    result.rows.forEach(r => console.log(`  ID ${r.id_rol}: ${r.nom_rol}`));
    
    pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    pool.end();
  }
}

fixRoles();
