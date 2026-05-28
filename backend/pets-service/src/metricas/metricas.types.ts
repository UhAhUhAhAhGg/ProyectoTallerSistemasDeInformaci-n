export interface MetricasRefugio {
  id_refug: number;
  total_publicaciones_activas: number;
  total_animales_adoptados: number;
  total_solicitudes_recibidas: number;
  solicitudes_aprobadas: number;
  solicitudes_rechazadas: number;
  solicitudes_pendientes: number;
  tasa_adopcion: number; // porcentaje 0-100 con un decimal posible
}
