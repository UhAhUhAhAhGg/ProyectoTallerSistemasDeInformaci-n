import { Request, Response } from 'express';
import '../middlewares/auth.middleware';
import * as service from './solicitud.service';
import * as estadoRepo from '../estados/estado.repository';
import * as histRepo from '../historial/historial.repository';
import {
    badRequest,
    created,
    forbidden, notFound,
    ok,
    serverError,
} from '../utils/response.helper';

// ─── HU-17: Adoptante envía solicitud ────────────────────────────────────────
export const enviarSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_publi, decrip_soli } = req.body;

    if (!id_publi || !decrip_soli?.trim()) {
      badRequest(res, 'id_publi y decrip_soli son requeridos');
      return;
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
    const solicitud = await service.enviarSolicitud(req.user!.id, { id_publi, decrip_soli }, token);
    created(res, solicitud, 'Solicitud enviada exitosamente');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al enviar la solicitud';
    badRequest(res, msg);
  }
};

// ─── HU-18: Adoptante ve sus solicitudes ─────────────────────────────────────
export const getMisSolicitudes = async (req: Request, res: Response): Promise<void> => {
  try {
    const solicitudes = await service.getMisSolicitudes(req.user!.id);
    ok(res, solicitudes);
  } catch {
    serverError(res);
  }
};

export const getMiSolicitudDetalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_soli = Number(req.params.id);
    const result = await service.getMiSolicitudDetalle(id_soli, req.user!.id);
    ok(res, result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    if (msg.includes('acceso') || msg.includes('pertenece')) {
      forbidden(res, msg);
    } else {
      notFound(res, msg);
    }
  }
};

// ─── HU-19: Usuario-refugio ve solicitudes recibidas ─────────────────────────
export const getSolicitudesRefugio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_refug = req.user!.refugioId;
    if (!id_refug) { forbidden(res, 'No estás asignado a un refugio'); return; }

    const solicitudes = await service.getSolicitudesRefugio(id_refug);
    ok(res, solicitudes);
  } catch {
    serverError(res);
  }
};

export const getSolicitudDetalleRefugio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_soli  = Number(req.params.id);
    const id_refug = req.user!.refugioId;
    if (!id_refug) { forbidden(res, 'No estás asignado a un refugio'); return; }

    const result = await service.getSolicitudDetalleRefugio(id_soli, id_refug);
    ok(res, result);
  } catch (err: unknown) {
    notFound(res, err instanceof Error ? err.message : 'No encontrado');
  }
};

// ─── HU-19: Usuario-refugio cambia estado ────────────────────────────────────
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_soli  = Number(req.params.id);
    const id_refug = req.user!.refugioId;
    const { id_est, motivo } = req.body;

    if (!id_refug) { forbidden(res, 'No estás asignado a un refugio'); return; }
    if (!id_est || !motivo?.trim()) {
      badRequest(res, 'id_est y motivo son requeridos');
      return;
    }

    const actualizada = await service.cambiarEstadoSolicitud(
      id_soli,
      { id_est, motivo },
      req.user!.id,
      id_refug,
    );
    ok(res, actualizada, 'Estado actualizado correctamente');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    badRequest(res, msg);
  }
};

// ─── Historial de una solicitud (compartido) ──────────────────────────────────
export const getHistorial = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_soli = Number(req.params.id);
    const historial = await histRepo.findHistorialBySolicitud(id_soli);
    ok(res, historial);
  } catch {
    serverError(res);
  }
};

// ─── Estados disponibles ──────────────────────────────────────────────────────
export const getEstados = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estados = await estadoRepo.findAllEstados();
    ok(res, estados);
  } catch {
    serverError(res);
  }
};
