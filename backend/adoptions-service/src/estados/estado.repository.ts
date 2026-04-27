import { pool } from '../config/database';
import { EstadoSolicitud } from './estado.types';

export const findAllEstados = async (): Promise<EstadoSolicitud[]> => {
  const { rows } = await pool.query('SELECT * FROM ESTAD_SOLI ORDER BY id_est');
  return rows;
};

export const findEstadoById = async (id: number): Promise<EstadoSolicitud | null> => {
  const { rows } = await pool.query('SELECT * FROM ESTAD_SOLI WHERE id_est = $1', [id]);
  return rows[0] || null;
};
