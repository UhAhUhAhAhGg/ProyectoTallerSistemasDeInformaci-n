export interface Pet {
  id: number;
  nombre: string;
  especie: 'perro' | 'gato';
  tamano: 'pequeno' | 'mediano' | 'grande';
  edad: 'cachorro' | 'adulto' | 'senior';
  zonaGeografica: string;
  refugioId: number;
  refugioNombre: string;
  sexo?: 'macho' | 'hembra';
  fotoUrl?: string;
}

export interface PetFilters {
  busqueda?: string;
  especie: string;
  tamano: string;
  edad: string;
  zonaGeografica: string;
  refugioId: string;
}
