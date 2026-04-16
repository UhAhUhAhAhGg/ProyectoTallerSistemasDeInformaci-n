import type {Pet, PetFilters } from '../types/pet';

const API_URL = 'http://localhost:3000/api';

export async function getPets(filters: PetFilters): Promise<Pet[]> {
  const params = new URLSearchParams();

  if (filters.especie) params.append('especie', filters.especie);
  if (filters.tamano) params.append('tamano', filters.tamano);
  if (filters.edad) params.append('edad', filters.edad);
  if (filters.zonaGeografica) params.append('zonaGeografica', filters.zonaGeografica);
  if (filters.refugioId) params.append('refugioId', filters.refugioId);

  const response = await fetch(`${API_URL}/pets?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Error al obtener mascotas');
  }

  return response.json();
}

export async function getRefugios() {
  const response = await fetch(`${API_URL}/refugios`);
  if (!response.ok) throw new Error('Error al obtener refugios');
  return response.json();
}