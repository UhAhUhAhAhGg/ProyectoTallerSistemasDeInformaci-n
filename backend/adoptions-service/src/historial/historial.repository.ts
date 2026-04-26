import { pool } from '../config/database';
import { CreateHistorialDto, HistorialAdopcion } from './historial.types';

export const createHistorial = async (dto: CreateHistorialDto): Promise<HistorialAdopcion> => {
  const { rows } = await pool.query(
    `INSERT INTO HISTO_ADOP
       (id_soli, id_est_anterior, id_est_nuevo, motivo, fech_cambio, id_usuario_accion)
     VALUES ($1, $2, $3, $4, NOW(), $5)
     RETURNING *`,
    [dto.id_soli, dto.id_est_anterior, dto.id_est_nuevo, dto.motivo, dto.id_usuario_accion]
  );
  return rows[0];
};

// HU-18: historial completo de una solicitud con nombres de estado
export const findHistorialBySolicitud = async (id_soli: number): Promise<HistorialAdopcion[]> => {
  const { rows } = await pool.query(
    `SELECT
       h.*,
       ea.nom_est AS nom_est_anterior,
       en.nom_est AS nom_est_nuevo
     FROM HISTO_ADOP h
     JOIN ESTAD_SOLI ea ON ea.id_est = h.id_est_anterior
     JOIN ESTAD_SOLI en ON en.id_est = h.id_est_nuevo
     WHERE h.id_soli = $1
     ORDER BY h.fech_cambio ASC`,
    [id_soli]
  );
  return rows;
};
