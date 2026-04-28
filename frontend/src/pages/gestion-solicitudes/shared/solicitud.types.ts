export type EstadoSolicitud = 'enviada' | 'en_revision' | 'aprobada' | 'rechazada' | 'en_espera';

export interface NuevaSolicitud {
  id_publi:    number;
  decrip_soli: string;
}

export interface Solicitud {
  id_soli:      number;
  id_publi:     number;
  id_usuario:   number;
  id_est:       number;
  decrip_soli:  string;
  fech_soli:    string;
  mot_soli?:    string;
  nom_animal?:  string;
  nom_adop?:    string;
  foto_animal?: string;
}