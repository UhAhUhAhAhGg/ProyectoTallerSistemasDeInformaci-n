export interface Conversacion {
  id_conversacion:      number;
  id_usuario_adoptante: number;
  id_refug:             number;
  id_publi:             number | null;
  fech_creacion:        string;
  ultimo_mensaje:       string | null;
  // enriquecidos desde el backend
  nom_adoptante?:       string;
  apell_adoptante?:     string;
  nom_refug?:           string;
  nom_mascot?:          string;
  no_leidos:            number;
}

export interface Mensaje {
  id_mensaje:      number;
  id_conversacion: number;
  id_remitente:    number;
  contenido:       string;
  leido:           boolean;
  fech_mensaje:    string;
  nom_remitente?:  string;
}
