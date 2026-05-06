require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const razas = [
  ['Perro', 'Mestizo'],
  ['Perro', 'Labrador'],
  ['Perro', 'Beagle'],
  ['Gato', 'Criollo'],
  ['Gato', 'Siames'],
  ['Conejo', 'Mini Lop'],
];

const mascotas = [
  {
    raza: 'Mestizo',
    nombre: 'Luna',
    edad: 2,
    nacimiento: '2024-02-12',
    descripcion: 'Perrita tranquila, carinosa y acostumbrada a paseos cortos.',
    genero: false,
    esterilizado: true,
    imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
  },
  {
    raza: 'Labrador',
    nombre: 'Max',
    edad: 4,
    nacimiento: '2022-03-20',
    descripcion: 'Perro sociable, jugueton y con mucha energia para una familia activa.',
    genero: true,
    esterilizado: true,
    imagen: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80',
  },
  {
    raza: 'Beagle',
    nombre: 'Toby',
    edad: 1,
    nacimiento: '2025-01-08',
    descripcion: 'Cachorro curioso, ideal para adoptantes con tiempo para entrenarlo.',
    genero: true,
    esterilizado: false,
    imagen: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=900&q=80',
  },
  {
    raza: 'Criollo',
    nombre: 'Misha',
    edad: 3,
    nacimiento: '2023-04-05',
    descripcion: 'Gatita independiente, limpia y muy dulce cuando gana confianza.',
    genero: false,
    esterilizado: true,
    imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
  },
  {
    raza: 'Siames',
    nombre: 'Nala',
    edad: 6,
    nacimiento: '2020-07-18',
    descripcion: 'Gata adulta, conversadora y tranquila, perfecta para departamento.',
    genero: false,
    esterilizado: true,
    imagen: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80',
  },
  {
    raza: 'Mini Lop',
    nombre: 'Copito',
    edad: 1,
    nacimiento: '2025-05-01',
    descripcion: 'Conejito docil que necesita un espacio seguro y supervisado.',
    genero: true,
    esterilizado: false,
    imagen: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80',
  },
];

async function getEspecieId(nombre) {
  const { rows } = await pool.query(
    'SELECT id_espe FROM ESPECIES WHERE LOWER(nom_espe) = LOWER($1)',
    [nombre],
  );
  if (!rows[0]) throw new Error(`No existe la especie ${nombre}`);
  return rows[0].id_espe;
}

async function ensureRaza(especie, raza) {
  const especieId = await getEspecieId(especie);
  const found = await pool.query(
    'SELECT id_raza FROM RAZAS WHERE id_espe = $1 AND LOWER(nom_raza) = LOWER($2)',
    [especieId, raza],
  );
  if (found.rows[0]) return found.rows[0].id_raza;

  const inserted = await pool.query(
    'INSERT INTO RAZAS (id_espe, nom_raza) VALUES ($1, $2) RETURNING id_raza',
    [especieId, raza],
  );
  return inserted.rows[0].id_raza;
}

async function ensureRefugio() {
  const correo = 'refugio.demo@petmatch.com';
  const hash = await bcrypt.hash('Refugio123456!', 12);

  const user = await pool.query(
    `INSERT INTO USUARIOS
      (id_rol, corr_usuario, contra_usuario, nom_usuario, apell_usuario, est_usuario,
       telf_usuario, fenac_usuario, gen_usuario, direc_usuario)
     VALUES (3, $1, $2, 'Refugio', 'Demo', 'activo', '70000001', '1995-01-01', true, 'Av. Siempre Viva 123')
     ON CONFLICT (corr_usuario) DO UPDATE
       SET est_usuario = EXCLUDED.est_usuario
     RETURNING id_usuario`,
    [correo, hash],
  );

  const refugio = await pool.query(
    `INSERT INTO REFUGIOS
      (id_usuario, nom_refug, dir_refug, telf_refug, licencia_refug, descripcion, est_aprobacion)
     VALUES
      ($1, 'Huellitas Demo', 'Av. Siempre Viva 123', '70000001', 'LIC-DEMO-001',
       'Refugio de prueba para poblar el catalogo local.', 'aprobado')
     ON CONFLICT (id_usuario) DO UPDATE
       SET est_aprobacion = 'aprobado'
     RETURNING id_refug`,
    [user.rows[0].id_usuario],
  );

  return refugio.rows[0].id_refug;
}

async function ensureMascota(mascota) {
  const byName = await pool.query(
    'SELECT id_raza FROM RAZAS WHERE LOWER(nom_raza) = LOWER($1)',
    [mascota.raza],
  );
  if (!byName.rows[0]) throw new Error(`No existe la raza ${mascota.raza}`);
  const razaId = byName.rows[0].id_raza;

  const found = await pool.query(
    'SELECT id_mascot FROM MASCOTAS WHERE LOWER(nom_mascot) = LOWER($1)',
    [mascota.nombre],
  );
  if (found.rows[0]) return found.rows[0].id_mascot;

  const inserted = await pool.query(
    `INSERT INTO MASCOTAS
      (id_raza, img_mascot, nom_mascot, edad_mascot, fenac_mascot,
       descrip_mascot, gen_mascot, esterilizado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id_mascot`,
    [
      razaId,
      mascota.imagen,
      mascota.nombre,
      mascota.edad,
      mascota.nacimiento,
      mascota.descripcion,
      mascota.genero,
      mascota.esterilizado,
    ],
  );
  return inserted.rows[0].id_mascot;
}

async function ensurePublicacion(idRefugio, idMascota, mascota) {
  const found = await pool.query(
    'SELECT id_publi FROM PUBLICACIONES WHERE id_refug = $1 AND id_mascot = $2',
    [idRefugio, idMascota],
  );
  if (found.rows[0]) return found.rows[0].id_publi;

  const inserted = await pool.query(
    `INSERT INTO PUBLICACIONES
      (id_mascot, id_refug, arch_publi, decrip_publi, est_adop, est_publi)
     VALUES ($1,$2,$3,$4,false,true)
     RETURNING id_publi`,
    [idMascota, idRefugio, mascota.imagen, mascota.descripcion],
  );
  return inserted.rows[0].id_publi;
}

async function seedDemo() {
  try {
    for (const [especie, raza] of razas) {
      await ensureRaza(especie, raza);
    }

    const idRefugio = await ensureRefugio();
    for (const mascota of mascotas) {
      const idMascota = await ensureMascota(mascota);
      await ensurePublicacion(idRefugio, idMascota, mascota);
    }

    console.log('Seed demo creado exitosamente');
    console.log('Refugio: refugio.demo@petmatch.com / Refugio123456!');
    console.log(`Mascotas publicadas: ${mascotas.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear seed demo:', error);
    process.exit(1);
  }
}

seedDemo();
