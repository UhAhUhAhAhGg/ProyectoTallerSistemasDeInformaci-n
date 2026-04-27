import { Request, Response } from 'express';
import { pool } from '../config/database';
import { ok, serverError } from '../utils/response.helper';

/**
 * GET /catalogo
 * Endpoint público. Acepta query params: especie, tamano, edad, refugioId
 */
export const getCatalogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { especie, tamano, edad, refugioId } = req.query as Record<string, string>;

    const conditions: string[] = ['p.est_publi = true', 'p.est_adop = false'];
    const values: unknown[] = [];
    let i = 1;

    if (especie)   { conditions.push(`LOWER(e.nom_espe) = LOWER($${i++})`); values.push(especie); }
    if (refugioId) { conditions.push(`p.id_refug = $${i++}`);               values.push(Number(refugioId)); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT
         p.id_publi, p.id_refug, p.fech_publi,
         p.arch_publi, p.decrip_publi,
         m.id_mascot, m.nom_mascot, m.edad_mascot, m.gen_mascot, m.esterilizado, m.img_mascot,
         r.nom_raza,
         e.nom_espe,
         ref.nom_refug, ref.dir_refug
       FROM PUBLICACIONES p
       JOIN MASCOTAS m      ON m.id_mascot = p.id_mascot
       JOIN RAZAS r         ON r.id_raza   = m.id_raza
       JOIN ESPECIES e      ON e.id_espe   = r.id_espe
       JOIN REFUGIOS ref    ON ref.id_refug = p.id_refug
       ${where}
       ORDER BY p.fech_publi DESC`,
      values,
    );

    ok(res, rows);
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al obtener catálogo');
  }
};

/** GET /catalogo/refugios — lista de refugios para el filtro del sidebar */
export const getRefugios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT id_refug AS id, nom_refug AS nombre FROM REFUGIOS
       WHERE est_aprobacion = 'aprobado' ORDER BY nom_refug`,
    );
    ok(res, rows);
  } catch { serverError(res); }
};