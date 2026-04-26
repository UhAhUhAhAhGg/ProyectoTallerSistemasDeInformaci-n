export interface EstadoSolicitud {
  id_est:  number;
  nom_est: string;
}

// Valores fijos que deben existir en la tabla ESTAD_SOLI
export enum EstadoId {
  ENVIADA     = 1,
  EN_REVISION = 2,
  APROBADA    = 3,
  RECHAZADA   = 4,
  EN_ESPERA   = 5,
}
