import { pool } from '../config/database';
import { Publicacion, CreatePublicacionDto, UpdatePublicacionDto } from '../publicaciones/Publicacion.types';

export const findPublicacionesByRefugio = async (id_refug: number): Promise<Publicacion[]> => {
  const { rows } = await pool.query(
    `SELECT p.*, m.nom_mascot, r.nom_raza, e.nom_espe
     FROM PUBLICACIONES p
     JOIN MASCOTAS m ON m.id_mascot = p.id_mascot
     JOIN RAZAS r ON r.id_raza = m.id_raza
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     WHERE p.id_refug = $1
     ORDER BY p.fech_publi DESC`,
    [id_refug],
  );
  return rows;
};

export const findAllPublicacionesActivas = async (): Promise<Publicacion[]> => {
  const { rows } = await pool.query(
    `SELECT p.*, m.nom_mascot, r.nom_raza, e.nom_espe
     FROM PUBLICACIONES p
     JOIN MASCOTAS m ON m.id_mascot = p.id_mascot
     JOIN RAZAS r ON r.id_raza = m.id_raza
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     WHERE p.est_publi = true AND p.est_adop = false
     ORDER BY p.fech_publi DESC`,
  );
  return rows;
};

export const findPublicacionById = async (id: number): Promise<Publicacion | null> => {
  const { rows } = await pool.query(
    `SELECT p.*, m.nom_mascot, r.nom_raza, e.nom_espe
     FROM PUBLICACIONES p
     JOIN MASCOTAS m ON m.id_mascot = p.id_mascot
     JOIN RAZAS r ON r.id_raza = m.id_raza
     JOIN ESPECIES e ON e.id_espe = r.id_espe
     WHERE p.id_publi = $1`,
    [id],
  );
  return rows[0] || null;
};

export const createPublicacion = async (
  id_refug: number,
  dto: CreatePublicacionDto,
): Promise<Publicacion> => {
  const { rows } = await pool.query(
    `INSERT INTO PUBLICACIONES
       (id_mascot, id_refug, arch_publi, decrip_publi)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [dto.id_mascot, id_refug, dto.arch_publi, dto.decrip_publi],
  );
  return rows[0];
};

export const updatePublicacion = async (
  id: number,
  dto: UpdatePublicacionDto,
): Promise<Publicacion | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (dto.arch_publi   !== undefined) { fields.push(`arch_publi = $${i++}`);   values.push(dto.arch_publi); }
  if (dto.decrip_publi !== undefined) { fields.push(`decrip_publi = $${i++}`); values.push(dto.decrip_publi); }

  if (fields.length === 0) return findPublicacionById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE PUBLICACIONES SET ${fields.join(', ')} WHERE id_publi = $${i} RETURNING *`,
    values,
  );
  return rows[0] || null;
};

// HU-09: cambiar estado activa/inactiva
export const toggleEstadoPublicacion = async (
  id: number,
  est_publi: boolean,
): Promise<Publicacion | null> => {
  const fech_baja = est_publi ? null : new Date();
  const { rows } = await pool.query(
    `UPDATE PUBLICACIONES
     SET est_publi = $1, fech_baja = $2
     WHERE id_publi = $3
     RETURNING *`,
    [est_publi, fech_baja, id],
  );
  return rows[0] || null;
};

// HU-11: dar de baja definitivamente (desactivar)
export const darDeBajaPublicacion = async (id: number): Promise<Publicacion | null> => {
  const { rows } = await pool.query(
    `UPDATE PUBLICACIONES
     SET est_publi = false, fech_baja = NOW()
     WHERE id_publi = $1
     RETURNING *`,
    [id],
  );
  return rows[0] || null;
};