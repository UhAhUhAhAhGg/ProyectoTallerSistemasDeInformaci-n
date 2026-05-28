import { pool }                    from '../config/database';
import * as convRepo               from '../conversaciones/conversacion.repository';
import * as msgRepo                from '../mensajes/mensaje.repository';
import { CreateMensajeDto, Mensaje } from './mensaje.types';
import { CreateConversacionDto }   from '../conversaciones/conversacion.types';

/**
 * Verifica que el usuario sea participante de la conversación
 * (adoptante dueño o usuario-refugio asignado).
 */
const verificarParticipante = async (
  id_conversacion: number,
  id_usuario: number,
): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT 1 FROM CONVERSACIONES c
     WHERE c.id_conversacion = $1
       AND (
         c.id_usuario_adoptante = $2
         OR c.id_refug IN (SELECT id_refug FROM REFUGIOS WHERE id_usuario = $2)
       )`,
    [id_conversacion, id_usuario],
  );
  if (rows.length === 0) {
    throw new Error('No tienes acceso a esta conversación');
  }
};

/**
 * Verifica que el refugio esté aprobado antes de permitir
 * que un adoptante inicie la conversación.
 */
const verificarRefugioAprobado = async (id_refug: number): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT est_aprobacion FROM REFUGIOS WHERE id_refug = $1`,
    [id_refug],
  );
  if (!rows[0] || rows[0].est_aprobacion !== 'aprobado') {
    throw new Error('Este refugio no está disponible para mensajes');
  }
};

/** Crea o recupera la conversación y envía el primer/siguiente mensaje. */
export const enviarMensaje = async (
  id_remitente: number,
  dto: CreateMensajeDto & CreateConversacionDto,
): Promise<Mensaje> => {
  if (!dto.contenido?.trim()) {
    throw new Error('El mensaje no puede estar vacío');
  }

  // Si viene id_conversacion directo, validar participante
  if (dto.id_conversacion) {
    await verificarParticipante(dto.id_conversacion, id_remitente);
  } else {
    // Primer mensaje: crear conversación
    if (!dto.id_refug) throw new Error('id_refug es requerido para iniciar una conversación');
    await verificarRefugioAprobado(dto.id_refug);
    const conv = await convRepo.findOrCreateConversacion(id_remitente, {
      id_refug: dto.id_refug,
      id_publi: dto.id_publi,
    });
    dto.id_conversacion = conv.id_conversacion;
  }

  const mensaje = await msgRepo.createMensaje(id_remitente, {
    id_conversacion: dto.id_conversacion,
    contenido:       dto.contenido,
  });

  await convRepo.updateUltimoMensaje(dto.id_conversacion);

  // Insertar notificación en la tabla NOTIFICACIONES
  await notificarDestinatario(dto.id_conversacion, id_remitente);

  return mensaje;
};

/** Inserta una notificación para el otro participante de la conversación. */
const notificarDestinatario = async (
  id_conversacion: number,
  id_remitente:    number,
): Promise<void> => {
  try {
    // Determinar quién es el destinatario
    const { rows } = await pool.query(
      `SELECT c.id_usuario_adoptante,
              r.id_usuario AS id_usuario_refugio
       FROM CONVERSACIONES c
       JOIN REFUGIOS r ON r.id_refug = c.id_refug
       WHERE c.id_conversacion = $1`,
      [id_conversacion],
    );
    if (!rows[0]) return;

    const destinatario =
      rows[0].id_usuario_adoptante === id_remitente
        ? rows[0].id_usuario_refugio
        : rows[0].id_usuario_adoptante;

    await pool.query(
      `INSERT INTO NOTIFICACIONES
         (id_usuario, tipo_notif, titulo_notif, cuerpo_notif, ref_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        destinatario,
        'mensaje_nuevo',
        'Nuevo mensaje',
        'Tienes un mensaje nuevo en una de tus conversaciones.',
        id_conversacion,
      ],
    );
  } catch (err) {
    console.error('[messaging] Error al notificar:', err);
  }
};
