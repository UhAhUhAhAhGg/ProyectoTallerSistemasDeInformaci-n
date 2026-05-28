export interface Conversacion {
  id_conversacion:      number;
  id_usuario_adoptante: number;
  id_refug:             number;
  id_publi:             number | null;
  fech_creacion:        Date;
  ultimo_mensaje:       Date | null;
  // campos enriquecidos con JOINs
  nom_adoptante?:       string;
  apell_adoptante?:     string;
  nom_refug?:           string;
  nom_mascot?:          string;
  no_leidos?:           number;
}

export interface CreateConversacionDto {
  id_refug: number;
  id_publi?: number;
}

export interface MensajeResumen {
  contenido:    string;
  fech_mensaje: Date;
  id_remitente: number;
}
