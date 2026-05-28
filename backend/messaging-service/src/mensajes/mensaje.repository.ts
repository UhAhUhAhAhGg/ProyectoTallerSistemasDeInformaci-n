import { pool } from '../config/database';
import { Mensaje, CreateMensajeDto } from './mensaje.types';

export const createMensaje = async (
  id_remitente: number,
  dto: CreateMensajeDto,
): Promise<Mensaje> => {
  const { rows } = await pool.query(
    `INSERT INTO MENSAJES (id_conversacion, id_remitente, contenido)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [dto.id_conversacion, id_remitente, dto.contenido.trim()],
  );
  return rows[0];
};

export const findMensajesByConversacion = async (
  id_conversacion: number,
): Promise<Mensaje[]> => {
  const { rows } = await pool.query(
    `SELECT msg.*,
            u.nom_usuario AS nom_remitente
     FROM MENSAJES msg
     JOIN USUARIOS u ON u.id_usuario = msg.id_remitente
     WHERE msg.id_conversacion = $1
     ORDER BY msg.fech_mensaje ASC`,
    [id_conversacion],
  );
  return rows;
};

export const marcarComoLeidos = async (
  id_conversacion: number,
  id_usuario:      number,   // marca como leídos los mensajes que NO envió este usuario
): Promise<void> => {
  await pool.query(
    `UPDATE MENSAJES
     SET leido = true
     WHERE id_conversacion = $1
       AND id_remitente    <> $2
       AND leido = false`,
    [id_conversacion, id_usuario],
  );
};

export const countNoLeidos = async (
  id_usuario: number,
): Promise<number> => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM MENSAJES msg
     JOIN CONVERSACIONES c ON c.id_conversacion = msg.id_conversacion
     WHERE (c.id_usuario_adoptante = $1
            OR c.id_refug IN (SELECT id_refug FROM REFUGIOS WHERE id_usuario = $1))
       AND msg.id_remitente <> $1
       AND msg.leido = false`,
    [id_usuario],
  );
  return rows[0]?.total ?? 0;
};
