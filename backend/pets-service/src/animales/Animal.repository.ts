import { pool } from '../config/database';
import { Animal, CreateAnimalDto, UpdateAnimalDto, Raza, Especie } from '../animales/Animal.types';

export const findAllAnimales = async (): Promise<Animal[]> => {
  const { rows } = await pool.query(
    `SELECT m.*, r.nom_raza, e.nom_espe
     FROM MASCOTAS m
     JOIN RAZAS r ON r.id_raza = m.id_raza
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     ORDER BY m.id_mascot DESC`,
  );
  return rows;
};

export const findAnimalById = async (id: number): Promise<Animal | null> => {
  const { rows } = await pool.query(
    `SELECT m.*, r.nom_raza, e.nom_espe
     FROM MASCOTAS m
     JOIN RAZAS r ON r.id_raza = m.id_raza
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     WHERE m.id_mascot = $1`,
    [id],
  );
  return rows[0] || null;
};

/** Animales de un refugio específico (via PUBLICACIONES) */
export const findAnimalesByRefugio = async (id_refug: number): Promise<Animal[]> => {
  const { rows } = await pool.query(
    `SELECT m.*, r.nom_raza, e.nom_espe
     FROM MASCOTAS m
     JOIN RAZAS r ON r.id_raza = m.id_raza
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     WHERE m.id_mascot IN (
       SELECT id_mascot FROM PUBLICACIONES WHERE id_refug = $1
     )
     ORDER BY m.id_mascot DESC`,
    [id_refug],
  );
  return rows;
};

export const createAnimal = async (dto: CreateAnimalDto): Promise<Animal> => {
  const { rows } = await pool.query(
    `INSERT INTO MASCOTAS
       (id_raza, nom_mascot, edad_mascot, fenac_mascot,
        descrip_mascot, gen_mascot, esterilizado, img_mascot)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      dto.id_raza, dto.nom_mascot, dto.edad_mascot,
      dto.fenac_mascot || new Date().toISOString().slice(0, 10),
      dto.descrip_mascot, dto.gen_mascot, dto.esterilizado, dto.img_mascot,
    ],
  );
  return rows[0];
};

export const updateAnimal = async (id: number, dto: UpdateAnimalDto): Promise<Animal | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (dto.nom_mascot    !== undefined) { fields.push(`nom_mascot = $${i++}`);     values.push(dto.nom_mascot); }
  if (dto.edad_mascot   !== undefined) { fields.push(`edad_mascot = $${i++}`);    values.push(dto.edad_mascot); }
  if (dto.descrip_mascot!== undefined) { fields.push(`descrip_mascot = $${i++}`); values.push(dto.descrip_mascot); }
  if (dto.gen_mascot    !== undefined) { fields.push(`gen_mascot = $${i++}`);     values.push(dto.gen_mascot); }
  if (dto.esterilizado  !== undefined) { fields.push(`esterilizado = $${i++}`);   values.push(dto.esterilizado); }
  if (dto.img_mascot    !== undefined) { fields.push(`img_mascot = $${i++}`);     values.push(dto.img_mascot); }
  if (dto.id_raza       !== undefined) { fields.push(`id_raza = $${i++}`);        values.push(dto.id_raza); }

  if (fields.length === 0) return findAnimalById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE MASCOTAS SET ${fields.join(', ')} WHERE id_mascot = $${i} RETURNING *`,
    values,
  );
  return rows[0] || null;
};

/** Razas — filtra por especie si se pasa id_espe */
export const findAllRazas = async (id_espe?: number): Promise<Raza[]> => {
  if (id_espe) {
    const { rows } = await pool.query(
      `SELECT r.*, e.nom_espe FROM RAZAS r
       JOIN ESPECIES e ON e.id_espe = r.id_espe
       WHERE r.id_espe = $1
       ORDER BY r.nom_raza`,
      [id_espe],
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT r.*, e.nom_espe FROM RAZAS r
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     ORDER BY e.nom_espe, r.nom_raza`,
  );
  return rows;
};

export const findAllEspecies = async (): Promise<Especie[]> => {
  const { rows } = await pool.query('SELECT * FROM ESPECIES ORDER BY nom_espe');
  return rows;
};