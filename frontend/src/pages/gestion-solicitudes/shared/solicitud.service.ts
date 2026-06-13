import type { Solicitud, NuevaSolicitud, EstadoSolicitud } from './solicitud.types';

const BASE = import.meta.env.VITE_ADOPTIONS_API_URL ?? 'http://localhost:3004';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

async function parseError(res: Response, fallback: string) {
  const body = await res.json().catch(() => ({}));
  return body.message || body.mensaje || fallback;
}

const ESTADO_ID: Record<EstadoSolicitud, number> = {
  enviada:     1,
  en_revision: 2,
  aprobada:    3,
  rechazada:   4,
  en_espera:   5,
  completada:  6,
};

export const solicitudService = {
  // HU-16: adoptante envía solicitud
  async enviar(data: NuevaSolicitud): Promise<Solicitud> {
    const r = await fetch(`${BASE}/solicitudes`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(await parseError(r, 'Error al enviar solicitud'));
    const json = await r.json();
    return json.data ?? json;
  },

  // HU-17: solicitudes del adoptante autenticado (usa JWT, no necesita ID)
  async porAdoptante(): Promise<Solicitud[]> {
    const r = await fetch(`${BASE}/solicitudes/mis`, { headers: headers() });
    if (!r.ok) throw new Error('Error al cargar solicitudes');
    const json = await r.json();
    return json.data ?? json;
  },

  // HU-18: solicitudes recibidas por el refugio autenticado (usa JWT)
  async porRefugio(): Promise<Solicitud[]> {
    const r = await fetch(`${BASE}/solicitudes/refugio`, { headers: headers() });
    if (!r.ok) throw new Error('Error al cargar solicitudes');
    const json = await r.json();
    return json.data ?? json;
  },

  // HU-19: cambiar estado + motivo (requiere rol refugio)
  async actualizarEstado(
    id_soli: number, est_soli: EstadoSolicitud, mot_soli?: string
  ): Promise<Solicitud> {
    const r = await fetch(`${BASE}/solicitudes/refugio/${id_soli}/estado`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id_est: ESTADO_ID[est_soli], motivo: mot_soli ?? '' }),
    });
    if (!r.ok) throw new Error('Error al actualizar solicitud');
    const json = await r.json();
    return json.data ?? json;
  },
};