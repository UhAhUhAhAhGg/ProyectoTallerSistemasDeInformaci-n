export interface HistorialAdopcion {
  id_ha:             number;
  id_soli:           number;
  id_est_anterior:   number;
  nom_est_anterior?: string;
  id_est_nuevo:      number;
  nom_est_nuevo?:    string;
  motivo:            string;
  fech_cambio:       Date;
  id_usuario_accion: number;
}

export interface CreateHistorialDto {
  id_soli:           number;
  id_est_anterior:   number;
  id_est_nuevo:      number;
  motivo:            string;
  id_usuario_accion: number;
}
