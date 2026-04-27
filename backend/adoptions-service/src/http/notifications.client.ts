import axios from 'axios';
import { ENV } from '../config/env';

export type TipoNotificacion =
  | 'solicitud_enviada'
  | 'solicitud_en_revision'
  | 'solicitud_aprobada'
  | 'solicitud_rechazada'
  | 'solicitud_en_espera';

interface NotifyPayload {
  id_usuario: number;
  tipo:       TipoNotificacion;
  id_soli:    number;
  motivo?:    string;
}

// HU-21: notifica al adoptante cuando cambia el estado de su solicitud
export const notificarAdoptante = async (payload: NotifyPayload): Promise<void> => {
  try {
    await axios.post(`${ENV.SERVICES.notifications}/notify`, payload);
  } catch (err) {
    // No interrumpir el flujo principal si falla la notificación
    console.error('[notifications.client] Error al notificar:', err);
  }
};
