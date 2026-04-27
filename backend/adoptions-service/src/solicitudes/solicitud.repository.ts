import { pool } from '../config/database';
import { SolicitudAdopcion, CreateSolicitudDto } from './solicitud.types';
import { EstadoId } from '../estados/estado.types';

// HU-17: crear solicitud con estado inicial ENVIADA
export const createSolicitud = async (
  id_usuario: number,
  dto: CreateSolicitudDto
): Promise<SolicitudAdopcion> => {
  const { rows } = await pool.query(
    `INSERT INTO SOLI_ADOP
       (id_usuario, id_publi, id_est, fech_soli, decrip_soli)
     VALUES ($1, $2, $3, NOW(), $4)
     RETURNING *`,
    [id_usuario, dto.id_publi, EstadoId.ENVIADA, dto.decrip_soli]
  );
  return rows[0];
};

// HU-18: mis solicitudes como adoptante con nombre de estado
export const findSolicitudesByAdoptante = async (
  id_usuario: number
): Promise<SolicitudAdopcion[]> => {
  const { rows } = await pool.query(
    `SELECT s.*, e.nom_est
     FROM SOLI_ADOP s
     JOIN ESTAD_SOLI e ON e.id_est = s.id_est
     WHERE s.id_usuario = $1
     ORDER BY s.fech_soli DESC`,
    [id_usuario]
  );
  return rows;
};

// HU-19: solicitudes recibidas en el refugio (por id_refug en la publicación)
export const findSolicitudesByRefugio = async (
  id_refug: number
): Promise<SolicitudAdopcion[]> => {
  const { rows } = await pool.query(
    `SELECT s.*, e.nom_est, p.id_refug
     FROM SOLI_ADOP s
     JOIN ESTAD_SOLI e  ON e.id_est   = s.id_est
     JOIN PUBLICACIONES p ON p.id_publi = s.id_publi
     WHERE p.id_refug = $1
     ORDER BY s.fech_soli DESC`,
    [id_refug]
  );
  return rows;
};

export const findSolicitudById = async (
  id_soli: number
): Promise<SolicitudAdopcion | null> => {
  const { rows } = await pool.query(
    `SELECT s.*, e.nom_est
     FROM SOLI_ADOP s
     JOIN ESTAD_SOLI e ON e.id_est = s.id_est
     WHERE s.id_soli = $1`,
    [id_soli]
  );
  return rows[0] || null;
};

// HU-19: actualizar estado (retorna la solicitud actualizada)
export const updateEstadoSolicitud = async (
  id_soli: number,
  id_est:  number
): Promise<SolicitudAdopcion | null> => {
  const { rows } = await pool.query(
    `UPDATE SOLI_ADOP
     SET id_est = $1
     WHERE id_soli = $2
     RETURNING *`,
    [id_est, id_soli]
  );
  return rows[0] || null;
};

// Evitar que el mismo adoptante haga dos solicitudes activas sobre la misma publicación
export const findSolicitudActivaDuplicada = async (
  id_usuario: number,
  id_publi:   number
): Promise<SolicitudAdopcion | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM SOLI_ADOP
     WHERE id_usuario = $1
       AND id_publi   = $2
       AND id_est NOT IN (4)   -- 4 = rechazada, puede volver a solicitar
     LIMIT 1`,
    [id_usuario, id_publi]
  );
  return rows[0] || null;
};
