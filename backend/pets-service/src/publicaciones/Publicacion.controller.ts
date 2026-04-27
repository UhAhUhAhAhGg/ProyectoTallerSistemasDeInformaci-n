import { Request, Response } from 'express';
import * as repo from '../publicaciones/Publicacion.repository';
import { ok, created, badRequest, notFound, forbidden, serverError } from '../utils/response.helper';

export const listarPublicaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_refug = req.user!.id_refug;
    if (!id_refug) { forbidden(res, 'No estás asignado a un refugio'); return; }
    ok(res, await repo.findPublicacionesByRefugio(id_refug));
  } catch { serverError(res); }
};

export const obtenerPublicacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const pub = await repo.findPublicacionById(Number(req.params.id));
    if (!pub) { notFound(res); return; }
    ok(res, pub);
  } catch { serverError(res); }
};

export const crearPublicacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_refug = req.user!.id_refug;
    if (!id_refug) { forbidden(res, 'No estás asignado a un refugio'); return; }

    const { id_mascot, arch_publi, decrip_publi } = req.body;
    if (!id_mascot || !arch_publi || !decrip_publi) {
      badRequest(res, 'id_mascot, arch_publi y decrip_publi son requeridos'); return;
    }

    const pub = await repo.createPublicacion(id_refug, { id_mascot, arch_publi, decrip_publi });
    created(res, pub, 'Publicación creada exitosamente');
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al crear publicación');
  }
};

export const editarPublicacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const pub = await repo.updatePublicacion(Number(req.params.id), req.body);
    if (!pub) { notFound(res); return; }
    ok(res, pub, 'Publicación actualizada');
  } catch { serverError(res); }
};

export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { est_publi } = req.body;
    if (typeof est_publi !== 'boolean') {
      badRequest(res, 'est_publi debe ser true o false'); return;
    }
    const pub = await repo.toggleEstadoPublicacion(Number(req.params.id), est_publi);
    if (!pub) { notFound(res); return; }
    ok(res, pub, `Publicación ${est_publi ? 'activada' : 'desactivada'}`);
  } catch { serverError(res); }
};

export const darDeBaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const pub = await repo.darDeBajaPublicacion(Number(req.params.id));
    if (!pub) { notFound(res); return; }
    ok(res, pub, 'Publicación dada de baja');
  } catch { serverError(res); }
};