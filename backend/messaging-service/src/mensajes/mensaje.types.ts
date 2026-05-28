export interface Mensaje {
  id_mensaje:      number;
  id_conversacion: number;
  id_remitente:    number;
  contenido:       string;
  leido:           boolean;
  fech_mensaje:    Date;
  // enriquecido
  nom_remitente?:  string;
}

export interface CreateMensajeDto {
  id_conversacion: number;
  contenido:       string;
}
