import { pool } from '../config/database';

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

const TITULOS: Record<TipoNotificacion, string> = {
  solicitud_enviada:     'Solicitud enviada',
  solicitud_en_revision: 'Tu solicitud está en revisión',
  solicitud_aprobada:    '¡Tu solicitud fue aprobada!',
  solicitud_rechazada:   'Tu solicitud fue rechazada',
  solicitud_en_espera:   'Tu solicitud está en espera',
};

export const notificarAdoptante = async (p: NotifyPayload): Promise<void> => {
  try {
    const titulo = TITULOS[p.tipo];
    const cuerpo = p.motivo
      ? `${titulo}. Motivo: ${p.motivo}`
      : `${titulo}. Revisa tu historial de solicitudes.`;

    await pool.query(
      `INSERT INTO NOTIFICACIONES (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [p.id_usuario, p.tipo, titulo, cuerpo, p.id_soli]
    );
  } catch (err) {
    console.error('[notifications] Error al insertar notificación:', err);
  }
};