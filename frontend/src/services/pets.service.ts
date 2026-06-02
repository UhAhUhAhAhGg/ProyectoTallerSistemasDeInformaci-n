import type { PetFilters } from '../types/pet';

const BASE = import.meta.env.VITE_PETS_API_URL || 'http://localhost:3003';

async function parseError(res: Response, fallback: string) {
  const err = await res.json().catch(() => ({}));
  return err.message || fallback;
}

export type { PetFilters };

export async function getPets(filters: PetFilters & { busqueda?: string } = { especie: '', edad: '', zonaGeografica: '', refugioId: '' }) {
  const params = new URLSearchParams();
  if (filters.busqueda)       params.append('busqueda',       filters.busqueda);
  if (filters.especie)        params.append('especie',        filters.especie);
  if (filters.edad)           params.append('edad',           filters.edad);
  if (filters.zonaGeografica) params.append('zonaGeografica', filters.zonaGeografica);
  if (filters.refugioId)      params.append('refugioId',      String(filters.refugioId));

  const res = await fetch(`${BASE}/catalogo?${params}`);
  if (!res.ok) throw new Error('Error al obtener mascotas');
  const json = await res.json();
  return json.data ?? [];
}

export async function getRefugios() {
  const res = await fetch(`${BASE}/catalogo/refugios`);
  if (!res.ok) throw new Error('Error al obtener refugios');
  const json = await res.json();
  return json.data ?? [];
}

export async function getEspecies() {
  const res = await fetch(`${BASE}/animales/especies`);
  if (!res.ok) throw new Error('Error al obtener especies');
  const json = await res.json();
  return json.data ?? [];
}

export async function getRecomendaciones(): Promise<{ data: unknown[]; mensaje: string }> {
  const res = await fetch(`${BASE}/recomendaciones`, { headers: authHeadersNoContent() });
  if (!res.ok) throw new Error(await parseError(res, 'Error al obtener recomendaciones'));
  const json = await res.json();
  return {
    data:    json.data    ?? [],
    mensaje: json.mensaje ?? '',
  };
}

export async function getRazas(id_espe?: number) {
  const url = id_espe
    ? `${BASE}/animales/razas?id_espe=${id_espe}`
    : `${BASE}/animales/razas`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener razas');
  const json = await res.json();
  return json.data ?? [];
}

function authHeaders(contentType = 'application/json') {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': contentType,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function authHeadersNoContent(): HeadersInit | undefined {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getAnimalesRefugio() {
  const res = await fetch(`${BASE}/animales`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res, 'Error al obtener animales'));
  const json = await res.json();
  return json.data ?? [];
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

export async function crearAnimal(data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/animales`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear animal');
  }
  return res.json();
}

export async function actualizarAnimal(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/animales/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar animal');
  }
  return res.json();
}

export async function eliminarAnimal(id: number) {
  const res = await fetch(`${BASE}/animales/${id}`, {
    method: 'DELETE',
    headers: authHeadersNoContent(),
  });
  if (!res.ok) throw new Error('Error al eliminar animal');
  return res.json();
}

export async function getPublicaciones() {
  const res = await fetch(`${BASE}/publicaciones`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener publicaciones');
  const json = await res.json();
  return json.data ?? [];
}

export async function crearPublicacion(data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/publicaciones`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear publicación');
  }
  return res.json();
}

export async function actualizarPublicacion(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/publicaciones/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar publicación');
  return res.json();
}

export async function eliminarPublicacion(id: number) {
  const res = await fetch(`${BASE}/publicaciones/${id}`, {
    method: 'DELETE',
    headers: authHeadersNoContent(),
  });
  if (!res.ok) throw new Error('Error al eliminar publicación');
  return res.json();
}