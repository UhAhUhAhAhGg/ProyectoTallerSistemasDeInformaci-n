import type { Solicitud, NuevaSolicitud, EstadoSolicitud } from './solicitud.types';

const BASE = import.meta.env.VITE_SOLICITUDES_API_URL ?? 'http://localhost:3004/api';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

export const solicitudService = {
  // HU-16: adoptante envía solicitud
  async enviar(data: NuevaSolicitud): Promise<Solicitud> {
    const r = await fetch(`${BASE}/solicitudes`, {
      method: 'POST', headers: headers(), body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error('Error al enviar solicitud');
    return r.json();
  },

  // HU-17: historial del adoptante
  async porAdoptante(id_adop: number): Promise<Solicitud[]> {
    const r = await fetch(`${BASE}/solicitudes/adoptante/${id_adop}`, { headers: headers() });
    if (!r.ok) throw new Error('Error al cargar solicitudes');
    return r.json();
  },

  // HU-18: solicitudes recibidas por refugio
  async porRefugio(id_refu: number): Promise<Solicitud[]> {
    const r = await fetch(`${BASE}/solicitudes/refugio/${id_refu}`, { headers: headers() });
    if (!r.ok) throw new Error('Error al cargar solicitudes');
    return r.json();
  },

  // HU-18: cambiar estado + motivo
  async actualizarEstado(
    id_soli: number, est_soli: EstadoSolicitud, mot_soli?: string
  ): Promise<Solicitud> {
    const r = await fetch(`${BASE}/solicitudes/${id_soli}/estado`, {
      method: 'PATCH', headers: headers(), body: JSON.stringify({ est_soli, mot_soli }),
    });
    if (!r.ok) throw new Error('Error al actualizar solicitud');
    return r.json();
  },
};