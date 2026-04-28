const BASE = import.meta.env.VITE_PETS_API_URL || 'http://localhost:3003';

export interface PetFilters {
  especie?: string;
  raza?: string;
  edad?: string;
  refugioId?: number | string;
}

export async function getPets(filters: PetFilters = {}) {
  const params = new URLSearchParams();
  if (filters.especie)   params.append('especie', filters.especie);
  if (filters.raza)      params.append('raza', filters.raza);
  if (filters.edad)      params.append('edad', filters.edad);
  if (filters.refugioId) params.append('refugioId', String(filters.refugioId));

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

/** Razas filtradas por especie. Pasa id_espe para obtener solo las de esa especie. */
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
  if (!res.ok) throw new Error('Error al obtener animales');
  const json = await res.json();
  return json.data ?? [];
}

/**
 * Convierte un File a base64 data URL para enviarlo como JSON.
 * No requiere multer en el backend.
 */
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

// ── Publicaciones ──────────────────────────────────────────────────────────

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