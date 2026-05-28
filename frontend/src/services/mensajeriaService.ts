const BASE = import.meta.env.VITE_MESSAGING_API_URL || 'http://localhost:3005';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => ({}));
  return err.message || fallback;
}

/** GET /conversaciones */
export async function getConversaciones() {
  const res = await fetch(`${BASE}/conversaciones`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Error al obtener conversaciones'));
  const json = await res.json();
  return json.data ?? [];
}

/** GET /conversaciones/:id/mensajes */
export async function getMensajes(id_conversacion: number) {
  const res = await fetch(`${BASE}/conversaciones/${id_conversacion}/mensajes`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Error al obtener mensajes'));
  const json = await res.json();
  return json.data ?? [];
}

/**
 * POST /mensajes
 * Primer mensaje: pasa id_refug e id_publi (sin id_conversacion)
 * Mensajes siguientes: pasa id_conversacion
 */
export async function enviarMensaje(payload: {
  contenido:        string;
  id_conversacion?: number;
  id_refug?:        number;
  id_publi?:        number;
}) {
  const res = await fetch(`${BASE}/mensajes`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Error al enviar mensaje'));
  const json = await res.json();
  return json.data;
}

/** PATCH /conversaciones/:id/leidos */
export async function marcarLeidos(id_conversacion: number) {
  const res = await fetch(`${BASE}/conversaciones/${id_conversacion}/leidos`, {
    method:  'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Error al marcar como leídos'));
  return res.json();
}

/** GET /no-leidos — para el badge del navbar */
export async function getNoLeidos(): Promise<number> {
  const res = await fetch(`${BASE}/no-leidos`, {
    headers: authHeaders(),
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.data?.total ?? 0;
}
