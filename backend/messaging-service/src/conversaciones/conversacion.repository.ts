import { pool } from '../config/database';
import { Conversacion, CreateConversacionDto } from './conversacion.types';

/**
 * Busca una conversación existente o la crea si no existe.
 * El UNIQUE constraint en BD garantiza que no se duplique.
 */
export const findOrCreateConversacion = async (
  id_adoptante: number,
  dto: CreateConversacionDto,
): Promise<Conversacion> => {
  // Intentar insertar; si ya existe el UNIQUE, devuelve la existente
  const { rows } = await pool.query(
    `INSERT INTO CONVERSACIONES (id_usuario_adoptante, id_refug, id_publi)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_usuario_adoptante, id_refug, id_publi)
     DO UPDATE SET id_refug = EXCLUDED.id_refug   -- no-op para forzar el RETURNING
     RETURNING *`,
    [id_adoptante, dto.id_refug, dto.id_publi ?? null],
  );
  return rows[0];
};

/**
 * Devuelve todas las conversaciones de un usuario (adoptante o refugio)
 * enriquecidas con nombre del otro participante, mascota y conteo de no leídos.
 */
export const findConversacionesByUsuario = async (
  id_usuario: number,
  rol: 'adoptante' | 'refugio' | 'administrador',
): Promise<Conversacion[]> => {
  const condition = rol === 'adoptante'
    ? 'c.id_usuario_adoptante = $1'
    : `c.id_refug IN (SELECT id_refug FROM REFUGIOS WHERE id_usuario = $1)`;

  const { rows } = await pool.query(
    `SELECT
       c.*,
       u.nom_usuario   AS nom_adoptante,
       u.apell_usuario AS apell_adoptante,
       r.nom_refug,
       m.nom_mascot,
       (
         SELECT COUNT(*) FROM MENSAJES msg
         WHERE msg.id_conversacion = c.id_conversacion
           AND msg.leido = false
           AND msg.id_remitente <> $1
       )::int AS no_leidos
     FROM CONVERSACIONES c
     JOIN USUARIOS  u ON u.id_usuario = c.id_usuario_adoptante
     JOIN REFUGIOS  r ON r.id_refug   = c.id_refug
     LEFT JOIN PUBLICACIONES p ON p.id_publi = c.id_publi
     LEFT JOIN MASCOTAS      m ON m.id_mascot = p.id_mascot
     WHERE ${condition}
     ORDER BY c.ultimo_mensaje DESC NULLS LAST`,
    [id_usuario],
  );
  return rows;
};

export const findConversacionById = async (
  id: number,
): Promise<Conversacion | null> => {
  const { rows } = await pool.query(
    `SELECT c.*, u.nom_usuario AS nom_adoptante, r.nom_refug
     FROM CONVERSACIONES c
     JOIN USUARIOS u ON u.id_usuario = c.id_usuario_adoptante
     JOIN REFUGIOS r ON r.id_refug   = c.id_refug
     WHERE c.id_conversacion = $1`,
    [id],
  );
  return rows[0] || null;
};

export const updateUltimoMensaje = async (
  id_conversacion: number,
): Promise<void> => {
  await pool.query(
    `UPDATE CONVERSACIONES SET ultimo_mensaje = NOW()
     WHERE id_conversacion = $1`,
    [id_conversacion],
  );
};
