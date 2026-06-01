const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'bd_borrador',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
});

const runMigration = async () => {
  try {
    const sqlFile = path.join(__dirname, 'observaciones-seguimiento.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('📋 Ejecutando migración...');
    await pool.query(sql);
    console.log('✅ Migración completada exitosamente');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err);
    await pool.end();
    process.exit(1);
  }
};

runMigration();
