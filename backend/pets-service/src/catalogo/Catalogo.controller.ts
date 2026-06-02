// backend/pets-service/src/catalogo/Catalogo.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { ok, serverError } from '../utils/response.helper';

/**
 * GET /catalogo
 * Query params: busqueda, especie, edad, refugioId, zonaGeografica
 *   edad: 'cachorro' | 'joven' | 'adulto' | 'senior'
 *   (tamano todavía no soportado: la tabla MASCOTAS no tiene esa columna)
 */
export const getCatalogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, especie, edad, refugioId, zonaGeografica } = req.query as Record<string, string>;

    const conditions: string[] = ['p.est_publi = true', 'p.est_adop = false'];
    const values: unknown[] = [];
    let i = 1;

    if (especie) {
      conditions.push(`LOWER(e.nom_espe) = LOWER($${i++})`);
      values.push(especie);
    }

    if (busqueda) {
      conditions.push(`(
        m.nom_mascot ILIKE $${i}
        OR r.nom_raza ILIKE $${i}
        OR e.nom_espe ILIKE $${i}
        OR ref.nom_refug ILIKE $${i}
      )`);
      values.push(`%${busqueda}%`);
      i++;
    }

    if (zonaGeografica) {
      conditions.push(`ref.dir_refug ILIKE $${i++}`);
      values.push(`%${zonaGeografica}%`);
    }

    if (refugioId) {
      conditions.push(`p.id_refug = $${i++}`);
      values.push(Number(refugioId));
    }

    if (edad) {
      const rangos: Record<string, [number, number]> = {
        cachorro: [0, 1],
        joven:    [1, 3],
        adulto:   [3, 8],
        senior:   [8, 99],
      };
      const r = rangos[edad.toLowerCase()];
      if (r) {
        conditions.push(`m.edad_mascot >= $${i++} AND m.edad_mascot <= $${i++}`);
        values.push(r[0], r[1]);
      }
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows } = await pool.query(
      `SELECT
         p.id_publi, p.id_refug, p.fech_publi,
         p.arch_publi, p.decrip_publi,
         m.id_mascot, m.nom_mascot, m.edad_mascot, m.gen_mascot, m.esterilizado, m.img_mascot,
         m.descrip_mascot,
         r.nom_raza,
         e.nom_espe,
         ref.nom_refug, ref.dir_refug, ref.telf_refug
       FROM PUBLICACIONES p
       JOIN MASCOTAS m   ON m.id_mascot = p.id_mascot
       JOIN RAZAS r      ON r.id_raza   = m.id_raza
       JOIN ESPECIES e   ON e.id_espe   = r.id_espe
       JOIN REFUGIOS ref ON ref.id_refug = p.id_refug
       ${where}
       ORDER BY p.fech_publi DESC`,
      values,
    );

    ok(res, rows);
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al obtener catálogo');
  }
};

/** GET /catalogo/refugios — refugios aprobados para el sidebar */
export const getRefugios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT id_refug AS id, nom_refug AS nombre
       FROM REFUGIOS
       WHERE est_aprobacion = 'aprobado'
       ORDER BY nom_refug`,
    );
    ok(res, rows);
  } catch {
    serverError(res);
  }
};