export interface SolicitudAdopcion {
  id_soli:    number;
  id_usuario: number;
  id_publi:   number;
  id_est:     number;
  nom_est?:   string;
  fech_soli:  Date;
  decrip_soli: string;
  // Datos enriquecidos desde otros servicios (opcional, para respuestas)
  mascota?:   Record<string, unknown>;
  refugio?:   Record<string, unknown>;
}

// HU-17: payload que envía el adoptante
export interface CreateSolicitudDto {
  id_publi:    number;
  decrip_soli: string;
}

// HU-19: payload que envía el usuario-refugio
export interface CambiarEstadoDto {
  id_est: number;   // 2=en revisión, 3=aprobada, 4=rechazada, 5=en espera
  motivo: string;
}
