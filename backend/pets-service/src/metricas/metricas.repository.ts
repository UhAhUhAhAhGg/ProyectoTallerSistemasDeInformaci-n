import { pool } from '../config/database';
import { MetricasRefugio } from './metricas.types';

export const getMetricasByRefugio = async (
  id_refug: number,
): Promise<MetricasRefugio | null> => {
  try {
    const { rows } = await pool.query<MetricasRefugio>(
      `SELECT
         id_refug,
         total_publicaciones_activas,
         total_animales_adoptados,
         total_solicitudes_recibidas,
         solicitudes_aprobadas,
         solicitudes_rechazadas,
         solicitudes_pendientes,
         tasa_adopcion
       FROM v_metricas_refugio
       WHERE id_refug = $1`,
      [id_refug],
    );

    if (rows[0]) return rows[0];

    // Devolver estructura por defecto si no hay filas
    return {
      id_refug,
      total_publicaciones_activas: 0,
      total_animales_adoptados: 0,
      total_solicitudes_recibidas: 0,
      solicitudes_aprobadas: 0,
      solicitudes_rechazadas: 0,
      solicitudes_pendientes: 0,
      tasa_adopcion: 0,
    };
  } catch (err) {
    // Fallback: realizar queries directas si la vista no existe
    try {
      const pubResult = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE est_publi = true AND est_adop = false) AS activas,
           COUNT(*) FILTER (WHERE est_adop = true)                       AS adoptadas
         FROM PUBLICACIONES
         WHERE id_refug = $1`,
        [id_refug],
      );

      const soliResult = await pool.query(
        `SELECT
           COUNT(*)                                     AS total,
           COUNT(*) FILTER (WHERE sa.id_est = 3)       AS aprobadas,
           COUNT(*) FILTER (WHERE sa.id_est = 4)       AS rechazadas,
           COUNT(*) FILTER (WHERE sa.id_est IN (1,2,5)) AS pendientes
         FROM SOLI_ADOP sa
         JOIN PUBLICACIONES p ON p.id_publi = sa.id_publi
         WHERE p.id_refug = $1`,
        [id_refug],
      );

      const pub = pubResult.rows[0] || { activas: 0, adoptadas: 0 };
      const soli = soliResult.rows[0] || { total: 0, aprobadas: 0, rechazadas: 0, pendientes: 0 };

      const total = Number(soli.total ?? 0);
      const aprobadas = Number(soli.aprobadas ?? 0);

      return {
        id_refug,
        total_publicaciones_activas: Number(pub.activas ?? 0),
        total_animales_adoptados: Number(pub.adoptadas ?? 0),
        total_solicitudes_recibidas: total,
        solicitudes_aprobadas: aprobadas,
        solicitudes_rechazadas: Number(soli.rechazadas ?? 0),
        solicitudes_pendientes: Number(soli.pendientes ?? 0),
        tasa_adopcion: total > 0 ? Math.round((aprobadas / total) * 1000) / 10 : 0,
      };
    } catch (e) {
      return null;
    }
  }
};
