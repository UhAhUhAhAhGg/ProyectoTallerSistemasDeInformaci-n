import { Request, Response }    from 'express';
import * as service             from './mensaje.service';
import * as convRepo            from '../conversaciones/conversacion.repository';
import * as msgRepo             from '../mensajes/mensaje.repository';
import {
  ok, created, badRequest, forbidden, serverError,
} from '../utils/response.helper';

/** POST /mensajes */
export const enviarMensaje = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contenido, id_conversacion, id_refug, id_publi } = req.body;

    if (!contenido?.trim()) {
      badRequest(res, 'El contenido del mensaje es requerido');
      return;
    }
    if (!id_conversacion && !id_refug) {
      badRequest(res, 'Se requiere id_conversacion o id_refug para enviar un mensaje');
      return;
    }

    const mensaje = await service.enviarMensaje(req.user!.id, {
      contenido,
      id_conversacion,
      id_refug,
      id_publi,
    });

    created(res, mensaje, 'Mensaje enviado');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al enviar mensaje';
    if (msg.includes('acceso') || msg.includes('disponible')) {
      forbidden(res, msg);
    } else {
      badRequest(res, msg);
    }
  }
};

/** GET /conversaciones */
export const getConversaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const conversaciones = await convRepo.findConversacionesByUsuario(
      req.user!.id,
      req.user!.rol,
    );
    ok(res, conversaciones);
  } catch {
    serverError(res);
  }
};

/** GET /conversaciones/:id/mensajes */
export const getMensajesDeConversacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_conversacion = Number(req.params.id);
    const mensajes = await msgRepo.findMensajesByConversacion(id_conversacion);
    // Marcar como leídos automáticamente al abrir
    await msgRepo.marcarComoLeidos(id_conversacion, req.user!.id);
    ok(res, mensajes);
  } catch {
    serverError(res);
  }
};

/** PATCH /conversaciones/:id/leidos */
export const marcarLeidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_conversacion = Number(req.params.id);
    await msgRepo.marcarComoLeidos(id_conversacion, req.user!.id);
    ok(res, null, 'Mensajes marcados como leídos');
  } catch {
    serverError(res);
  }
};

/** GET /no-leidos — badge del navbar */
export const getNoLeidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await msgRepo.countNoLeidos(req.user!.id);
    ok(res, { total });
  } catch {
    serverError(res);
  }
};
