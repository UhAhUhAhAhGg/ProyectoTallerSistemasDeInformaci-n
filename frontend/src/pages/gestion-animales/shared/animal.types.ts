export interface Raza { id_raza: number; nom_raza: string; id_espe: number }
export interface Especie { id_espe: number; nom_espe: string }

export interface Animal {
  id_mascot: number
  id_raza: number
  nom_raza?: string
  nom_mascot: string
  edad_mascot: number
  fenac_mascot: string          // ISO date
  descrip_mascot: string
  gen_mascot: boolean           // true = macho
  esterilizado: boolean
  img_mascot: string
}

export interface Publicacion {
  id_publi: number
  id_mascot: number
  id_refug: number
  fech_publi: string
  fech_baja: string | null
  arch_publi: string
  decrip_publi: string
  est_adop: boolean
  est_publi: boolean
  animal?: Animal
}

export type EstadoAnimal = 'disponible' | 'en_proceso' | 'adoptado' | 'en_tratamiento'

export interface AnimalConEstado extends Animal {
  publicacion?: Publicacion
  estado: EstadoAnimal
}

export interface AnimalFormData {
  nom_mascot: string
  id_raza: number | ''
  edad_mascot: number | ''
  fenac_mascot: string
  descrip_mascot: string
  gen_mascot: boolean
  esterilizado: boolean
  img_mascot: string
  decrip_publi: string
}