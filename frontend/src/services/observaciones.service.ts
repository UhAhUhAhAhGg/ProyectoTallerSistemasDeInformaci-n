import axios from 'axios';

const ADOPTIONS_SERVICE_URL = 'http://localhost:3004';

// Crear instancia de axios para adoptions-service
const adoptionsApi = axios.create({
  baseURL: ADOPTIONS_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
adoptionsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ObservacionAdaptacion {
  id_obs: number;
  id_soli: number;
  id_refug: number;
  descripcion: string;
  fech_obs: string;
}

interface SeguimientoAdopcion {
  id_seg: number;
  id_soli: number;
  id_usuario: number;
  descripcion: string;
  fech_seg: string;
}

export interface Solicitud {
  id_soli: number;
  id_usuario?: number;
  id_publi?: number;
  id_refug?: number;
  id_est?: number;
  fech_soli?: string;
  decrip_soli?: string;
  nom_mascot?: string;
  nom_refug?: string;
  nom_usuario?: string;
  apell_usuario?: string;
  corr_usuario?: string;
  nom_est?: string;
}

// ═══════════════════════════════════════════════════════════════
// SOLICITUDES
// ═══════════════════════════════════════════════════════════════

export const solicitudesService = {
  // Obtener solicitudes del adoptante (HU-18)
  getMisSolicitudes: async (): Promise<Solicitud[]> => {
    const response = await adoptionsApi.get('/solicitudes/mis');
    return response.data.data || [];
  },

  // Obtener solicitudes recibidas por el refugio (HU-19)
  getSolicitudesRefugio: async (): Promise<Solicitud[]> => {
    const response = await adoptionsApi.get('/solicitudes/refugio');
    return response.data.data || [];
  },
};

// ═══════════════════════════════════════════════════════════════
// OBSERVACIONES DE ADAPTACIÓN (Refugio)
// ═══════════════════════════════════════════════════════════════

export const observacionesService = {
  // Crear observación (solo refugio)
  crearObservacion: async (idSoli: number, descripcion: string): Promise<ObservacionAdaptacion> => {
    const response = await adoptionsApi.post('/observaciones', {
      id_soli: idSoli,
      descripcion,
    });
    return response.data.data;
  },

  // Obtener observaciones de una solicitud
  obtenerObservaciones: async (idSoli: number): Promise<ObservacionAdaptacion[]> => {
    const response = await adoptionsApi.get(`/observaciones/${idSoli}`);
    return response.data.data || [];
  },
};

// ═══════════════════════════════════════════════════════════════
// SEGUIMIENTO DE ADOPCIÓN (Adoptante)
// ═══════════════════════════════════════════════════════════════

export const seguimientoService = {
  // Crear seguimiento (solo adoptante)
  crearSeguimiento: async (idSoli: number, descripcion: string): Promise<SeguimientoAdopcion> => {
    const response = await adoptionsApi.post('/observaciones/seguimientos', {
      id_soli: idSoli,
      descripcion,
    });
    return response.data.data;
  },

  // Obtener seguimientos de una solicitud
  obtenerSeguimientos: async (idSoli: number): Promise<SeguimientoAdopcion[]> => {
    const response = await adoptionsApi.get(`/observaciones/seguimientos/${idSoli}`);
    return response.data.data || [];
  },
};
