import { Request, Response } from 'express';
import { getMetricasByRefugio } from './metricas.repository';
import { forbidden, notFound, ok, serverError } from '../utils/response.helper';

export const getMetricasRefugio = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id_refug = Number(req.params.id_refug);

    if (isNaN(id_refug) || id_refug <= 0) {
      forbidden(res, 'id_refug inválido');
      return;
    }

    const esAdmin = req.user?.rol === 'administrador';
    const esElRefugio = req.user?.id_refug === id_refug;

    if (!esAdmin && !esElRefugio) {
      forbidden(res, 'Solo puedes ver las métricas de tu propio refugio');
      return;
    }

    const metricas = await getMetricasByRefugio(id_refug);

    if (!metricas) {
      notFound(res, 'Refugio no encontrado');
      return;
    }

    ok(res, metricas, 'Métricas obtenidas exitosamente');
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al obtener métricas');
  }
};
