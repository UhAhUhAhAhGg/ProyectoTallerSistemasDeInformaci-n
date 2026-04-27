export type EstadoSolicitud = 'enviada' | 'en_revision' | 'aprobada' | 'rechazada' | 'en_espera';

export interface Solicitud {
  id_soli: number;
  id_publ: number;
  id_adop: number;
  est_soli: EstadoSolicitud;
  fec_soli: string;
  mot_soli?: string; // motivo decisión refugio
  nom_animal?: string;
  nom_adop?: string;
  foto_animal?: string;
}

export interface NuevaSolicitud {
  id_publ: number;
  id_adop: number;
  mot_soli?: string; // mensaje inicial del adoptante
}