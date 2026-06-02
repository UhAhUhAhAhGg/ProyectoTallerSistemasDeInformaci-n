export interface Pet {
  id: number;
  nombre: string;
  especie: string;
  edad: 'cachorro' | 'joven' | 'adulto' | 'senior';
  zonaGeografica: string;
  refugioId: number;
  refugioNombre: string;
  sexo?: 'macho' | 'hembra';
  fotoUrl?: string;
}

export interface PetFilters {
  busqueda?: string;
  especie:        string;
  edad:           string;
  zonaGeografica: string;
  refugioId:      string;
}