import { Request, Response } from 'express';
import { badRequest, created, forbidden, ok, serverError } from '../utils/response.helper';
import * as service from './observacion.service';

// ═══════════════════════════════════════════════════════════════
// CONTROLADORES: Observaciones y Seguimiento
// ═══════════════════════════════════════════════════════════════

// HU: El refugio registra observaciones de adaptación
export const crearObservacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_soli, descripcion } = req.body;
    const idRefugio = req.user?.refugioId;

    if (!idRefugio) {
      forbidden(res, 'Solo los refugios pueden crear observaciones');
      return;
    }

    if (!id_soli || !descripcion?.trim()) {
      badRequest(res, 'id_soli y descripcion son requeridos');
      return;
    }

    const observacion = await service.crearObservacion(
      { id_soli, descripcion },
      idRefugio
    );

    created(res, observacion, 'Observación registrada exitosamente');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar observación';
    serverError(res, msg);
  }
};

// Obtener observaciones de una solicitud
export const obtenerObservacionesSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_soli } = req.params;

    if (!id_soli) {
      badRequest(res, 'id_soli es requerido');
      return;
    }

    const observaciones = await service.obtenerObservacionesSolicitud(Number(id_soli));
    ok(res, observaciones);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener observaciones';
    serverError(res, msg);
  }
};

// HU: El adoptante reporta novedades en seguimiento
export const crearSeguimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_soli, descripcion } = req.body;
    const idUsuario = req.user?.id;

    if (!idUsuario) {
      forbidden(res, 'Debes iniciar sesión para reportar seguimiento');
      return;
    }

    if (!id_soli || !descripcion?.trim()) {
      badRequest(res, 'id_soli y descripcion son requeridos');
      return;
    }

    const seguimiento = await service.crearSeguimiento(
      { id_soli, descripcion },
      idUsuario
    );

    created(res, seguimiento, 'Seguimiento reportado exitosamente');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al reportar seguimiento';
    serverError(res, msg);
  }
};

// Obtener seguimientos de una solicitud
export const obtenerSeguimientoSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_soli } = req.params;

    if (!id_soli) {
      badRequest(res, 'id_soli es requerido');
      return;
    }

    const seguimientos = await service.obtenerSeguimientoSolicitud(Number(id_soli));
    ok(res, seguimientos);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener seguimientos';
    serverError(res, msg);
  }
};
