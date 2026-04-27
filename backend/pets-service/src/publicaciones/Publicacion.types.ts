export interface Publicacion {
  id_publi:    number;
  id_mascot:   number;
  id_refug:    number;
  fech_publi:  Date;
  fech_baja:   Date | null;
  arch_publi:  string;
  decrip_publi: string;
  est_adop:    boolean;   // true = ya adoptado
  est_publi:   boolean;   // true = activa
  // joins
  nom_mascot?: string;
  nom_raza?:   string;
  nom_espe?:   string;
}

export interface CreatePublicacionDto {
  id_mascot:    number;
  arch_publi:   string;
  decrip_publi: string;
}

export interface UpdatePublicacionDto {
  arch_publi?:   string;
  decrip_publi?: string;
}