export interface Animal {
  id_mascot:      number;
  id_raza:        number;
  nom_mascot:     string;
  edad_mascot:    number;
  fenac_mascot:   Date;
  descrip_mascot: string;
  gen_mascot:     boolean;   // true = macho
  esterilizado:   boolean;
  img_mascot:     string;
  tamano_mascot?: 'pequeño' | 'mediano' | 'grande';
  // joins
  nom_raza?:      string;
  nom_espe?:      string;
}

export interface CreateAnimalDto {
  id_raza:        number;
  nom_mascot:     string;
  edad_mascot:    number;
  fenac_mascot:   string;  // ISO date
  descrip_mascot: string;
  gen_mascot:     boolean;
  esterilizado:   boolean;
  img_mascot:     string;
  tamano_mascot?: 'pequeño' | 'mediano' | 'grande';
}

export interface UpdateAnimalDto extends Partial<CreateAnimalDto> {}

export interface Raza {
  id_raza:  number;
  id_espe:  number;
  nom_raza: string;
  nom_espe?: string;
}

export interface Especie {
  id_espe:  number;
  nom_espe: string;
}