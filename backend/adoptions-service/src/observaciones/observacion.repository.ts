import { pool } from '../config/database';
import { CreateObservacionDto, CreateSeguimientoDto, ObservacionAdaptacion, SeguimientoAdopcion } from './observacion.types';

// ═══════════════════════════════════════════════════════════════
// OBSERVACIONES DE ADAPTACIÓN (Refugio)
// ═══════════════════════════════════════════════════════════════

export const createObservacion = async (
  dto: CreateObservacionDto,
  idRefugio: number
): Promise<ObservacionAdaptacion> => {
  const { rows } = await pool.query(
    `INSERT INTO OBSERVA_ADAPT (id_soli, id_refug, descripcion)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [dto.id_soli, idRefugio, dto.descripcion]
  );
  return rows[0];
};

export const getObservacionesBySolicitud = async (id_soli: number): Promise<ObservacionAdaptacion[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM OBSERVA_ADAPT WHERE id_soli = $1 ORDER BY fech_obs DESC`,
    [id_soli]
  );
  return rows;
};

export const getObservacionesByRefugio = async (id_refug: number): Promise<ObservacionAdaptacion[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM OBSERVA_ADAPT WHERE id_refug = $1 ORDER BY fech_obs DESC`,
    [id_refug]
  );
  return rows;
};

// ═══════════════════════════════════════════════════════════════
// SEGUIMIENTO DE ADOPCIÓN (Adoptante)
// ═══════════════════════════════════════════════════════════════

export const createSeguimiento = async (
  dto: CreateSeguimientoDto,
  idUsuario: number
): Promise<SeguimientoAdopcion> => {
  const { rows } = await pool.query(
    `INSERT INTO SEGUI_ADOP (id_soli, id_usuario, descripcion)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [dto.id_soli, idUsuario, dto.descripcion]
  );
  return rows[0];
};

export const getSeguimientoBySolicitud = async (id_soli: number): Promise<SeguimientoAdopcion[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM SEGUI_ADOP WHERE id_soli = $1 ORDER BY fech_seg DESC`,
    [id_soli]
  );
  return rows;
};

export const getSeguimientoByUsuario = async (id_usuario: number): Promise<SeguimientoAdopcion[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM SEGUI_ADOP WHERE id_usuario = $1 ORDER BY fech_seg DESC`,
    [id_usuario]
  );
  return rows;
};
