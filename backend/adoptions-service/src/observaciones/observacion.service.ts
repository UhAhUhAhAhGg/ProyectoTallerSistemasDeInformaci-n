import * as repo from './observacion.repository';
import { CreateObservacionDto, CreateSeguimientoDto, ObservacionAdaptacion, SeguimientoAdopcion } from './observacion.types';

// ═══════════════════════════════════════════════════════════════
// SERVICIOS: Observaciones y Seguimiento
// ═══════════════════════════════════════════════════════════════

// HU: El refugio registra observaciones de adaptación
export const crearObservacion = async (
  dto: CreateObservacionDto,
  idRefugio: number
): Promise<ObservacionAdaptacion> => {
  return repo.createObservacion(dto, idRefugio);
};

// HU: Obtener observaciones de una solicitud (para mostrar en seguimiento)
export const obtenerObservacionesSolicitud = async (id_soli: number): Promise<ObservacionAdaptacion[]> => {
  return repo.getObservacionesBySolicitud(id_soli);
};

// Obtener observaciones de un refugio (para dashboard)
export const obtenerObservacionesRefugio = async (id_refug: number): Promise<ObservacionAdaptacion[]> => {
  return repo.getObservacionesByRefugio(id_refug);
};

// HU: El adoptante reporta novedades en seguimiento
export const crearSeguimiento = async (
  dto: CreateSeguimientoDto,
  idUsuario: number
): Promise<SeguimientoAdopcion> => {
  return repo.createSeguimiento(dto, idUsuario);
};

// HU: Obtener seguimientos de una solicitud (para ver timeline)
export const obtenerSeguimientoSolicitud = async (id_soli: number): Promise<SeguimientoAdopcion[]> => {
  return repo.getSeguimientoBySolicitud(id_soli);
};

// Obtener seguimientos del adoptante (para dashboard)
export const obtenerSeguimientoUsuario = async (id_usuario: number): Promise<SeguimientoAdopcion[]> => {
  return repo.getSeguimientoByUsuario(id_usuario);
};
