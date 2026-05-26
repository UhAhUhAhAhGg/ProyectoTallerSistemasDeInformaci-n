export type EstadoSolicitud = 'enviada' | 'en_revision' | 'aprobada' | 'rechazada' | 'en_espera';

export interface NuevaSolicitud {
  id_publi:    number;
  decrip_soli: string;
}

export interface Solicitud {
  id_soli:       number;
  id_publi:      number;
  id_usuario:    number;
  id_refug:      number;
  id_est:        number;
  fech_soli:     string;
  decrip_soli:   string;
  nom_mascot:    string;
  nom_refug:     string;
  nom_usuario:   string;
  apell_usuario: string;
  corr_usuario:  string;
  nom_est:       string;
}