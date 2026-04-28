export interface CreateSolicitudDto {
  id_publi:    number;
  decrip_soli: string;
}

export interface CambiarEstadoDto {
  id_est: number;
  motivo: string;
}

export interface SolicitudAdopcion {
  id_soli:     number;
  id_publi:    number;
  id_usuario:  number;
  id_est:      number;
  decrip_soli: string;
  fech_soli:   Date;
  mot_soli?:   string;
}