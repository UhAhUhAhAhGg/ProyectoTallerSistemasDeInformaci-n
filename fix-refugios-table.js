const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  port: 5432,
  database: 'bd_borrador'
});

async function fixRefugiosTable() {
  try {
    console.log('🔧 Recreando tabla REFUGIOS con estructura correcta...\n');
    
    // Eliminar tabla vieja
    await pool.query('DROP TABLE IF EXISTS REFUGIOS CASCADE;');
    console.log('✅ Tabla REFUGIOS antigua eliminada');
    
    // Crear tabla nueva
    await pool.query(`
      CREATE TABLE REFUGIOS (
        id_refug serial PRIMARY KEY,
        id_usuario int NOT NULL UNIQUE,
        nom_refug varchar(80) NOT NULL,
        dir_refug varchar(200) NOT NULL,
        telf_refug varchar(20) NOT NULL,
        licencia_refug varchar(200) NOT NULL,
        descripcion text,
        est_aprobacion varchar(20) NOT NULL DEFAULT 'pendiente',
        fecha_solicitud timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla REFUGIOS recreada correctamente\n');
    
    // Verificar estructura
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'refugios' ORDER BY ordinal_position`
    );
    
    console.log('📋 Columnas en tabla REFUGIOS:');
    result.rows.forEach(r => console.log('  -', r.column_name));
    
    pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    pool.end();
  }
}

fixRefugiosTable();
