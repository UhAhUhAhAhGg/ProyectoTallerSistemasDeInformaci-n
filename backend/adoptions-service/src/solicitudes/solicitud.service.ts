import * as repo      from './solicitud.repository';
import * as histRepo  from '../historial/historial.repository';
import * as estadoRepo from '../estados/estado.repository';
import { getPublicacionDisponible }  from '../http/publicaciones.client';
import { notificarAdoptante, TipoNotificacion } from '../http/notifications.client';
import { CreateSolicitudDto, CambiarEstadoDto, SolicitudAdopcion } from './solicitud.types';
import { EstadoId } from '../estados/estado.types';

// Mapa: id_est → tipo de notificación
const NOTIF_MAP: Record<number, TipoNotificacion> = {
  [EstadoId.ENVIADA]:     'solicitud_enviada',
  [EstadoId.EN_REVISION]: 'solicitud_en_revision',
  [EstadoId.APROBADA]:    'solicitud_aprobada',
  [EstadoId.RECHAZADA]:   'solicitud_rechazada',
  [EstadoId.EN_ESPERA]:   'solicitud_en_espera',
  [EstadoId.COMPLETADA]:  'solicitud_completada',
};


//Adoptante envía solicitud formal

export const enviarSolicitud = async (
  id_usuario: number,
  dto: CreateSolicitudDto,
  token: string
): Promise<SolicitudAdopcion> => {

  const publicacion = await getPublicacionDisponible(dto.id_publi, token);
  if (!publicacion) {
    throw new Error('La publicación no existe o la mascota ya no está disponible para adopción');
  }

  const duplicada = await repo.findSolicitudActivaDuplicada(id_usuario, dto.id_publi);
  if (duplicada) {
    throw new Error('Ya tienes una solicitud activa para esta mascota');
  }

  const solicitud = await repo.createSolicitud(id_usuario, dto);

  await histRepo.createHistorial({
    id_soli:           solicitud.id_soli,
    id_est_anterior:   EstadoId.ENVIADA,
    id_est_nuevo:      EstadoId.ENVIADA,
    motivo:            'Solicitud enviada por adoptante',
    id_usuario_accion: id_usuario,
  });

  await notificarAdoptante({
    id_usuario,
    tipo:    'solicitud_enviada',
    id_soli: solicitud.id_soli,
  });

  return solicitud;
};

//Adoptante ve sus solicitudes

export const getMisSolicitudes = async (
  id_usuario: number
): Promise<SolicitudAdopcion[]> => {
  return repo.findSolicitudesByAdoptante(id_usuario);
};

export const getMiSolicitudDetalle = async (
  id_soli:    number,
  id_usuario: number
): Promise<{ solicitud: SolicitudAdopcion; historial: unknown[] }> => {
  const solicitud = await repo.findSolicitudById(id_soli);
  if (!solicitud) throw new Error('Solicitud no encontrada');

  // Solo el adoptante dueño puede ver su propia solicitud por esta vía
  if (solicitud.id_usuario !== id_usuario) {
    throw new Error('No tienes acceso a esta solicitud');
  }

  const historial = await histRepo.findHistorialBySolicitud(id_soli);
  return { solicitud, historial };
};

//Usuario-refugio gestiona solicitudes

export const getSolicitudesRefugio = async (
  id_refug: number
): Promise<SolicitudAdopcion[]> => {
  return repo.findSolicitudesByRefugio(id_refug);
};

export const cambiarEstadoSolicitud = async (
  id_soli:          number,
  dto:              CambiarEstadoDto,
  id_usuario_accion: number,
  id_refug_accion:  number
): Promise<SolicitudAdopcion> => {

  // 1. Verificar que la solicitud existe
  const solicitud = await repo.findSolicitudById(id_soli);
  if (!solicitud) throw new Error('Solicitud no encontrada');

  // 2. Verificar que la solicitud pertenece a este refugio
  // @ts-ignore — id_refug viene del JOIN en el repo
  if (solicitud.id_refug !== undefined && solicitud.id_refug !== id_refug_accion) {
    throw new Error('Esta solicitud no pertenece a tu refugio');
  }

  // 3. Verificar que el nuevo estado existe
  const nuevoEstado = await estadoRepo.findEstadoById(dto.id_est);
  if (!nuevoEstado) throw new Error('Estado no válido');

  // 4. Actualizar estado
  const actualizada = await repo.updateEstadoSolicitud(id_soli, dto.id_est);
  if (!actualizada) throw new Error('Error al actualizar la solicitud');

  // 5. Registrar historial del cambio
  await histRepo.createHistorial({
    id_soli,
    id_est_anterior:   solicitud.id_est,
    id_est_nuevo:      dto.id_est,
    motivo:            dto.motivo,
    id_usuario_accion,
  });

  // 6. Notificar al adoptante del cambio de estado (HU-21)
  const tipoNotif = NOTIF_MAP[dto.id_est];
  if (tipoNotif) {
    await notificarAdoptante({
      id_usuario: solicitud.id_usuario,
      tipo:       tipoNotif,
      id_soli,
      motivo:     dto.motivo,
    });
  }

  return actualizada;
};

//Detalle de una solicitud con historial (vista del refugio)
export const getSolicitudDetalleRefugio = async (
  id_soli:   number,
  id_refug:  number
): Promise<{ solicitud: SolicitudAdopcion; historial: unknown[] }> => {
  const solicitud = await repo.findSolicitudById(id_soli);
  if (!solicitud) throw new Error('Solicitud no encontrada');

  const historial = await histRepo.findHistorialBySolicitud(id_soli);
  return { solicitud, historial };
};
