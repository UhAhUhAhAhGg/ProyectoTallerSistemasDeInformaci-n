// frontend/src/services/api.ts
// filepath: src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funciones de autenticación
export const authService = {
  register: async (data: {
    correo: string;
    contrasena: string;
    confirmar_contrasena: string;
    rol: 'adoptante' | 'refugio';
    nombre?: string;
    apellido?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (correo: string, contrasena: string) => {
    const response = await api.post('/auth/login', { correo, contrasena });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Funciones de perfil adoptante
export const perfilService = {
  guardarPerfil: async (data: {
    tipo_vivienda: string;
    tiene_patio: boolean;
    disp_tiempo: string;
    exp_previa: boolean;
    desc_exp?: string;
    pref_especie?: number;
    pref_tamanio?: string;
    pref_edad?: string;
    acepta_ninos: boolean;
    acepta_otros: boolean;
  }) => {
    const response = await api.post('/perfil-adoptante', data);
    return response.data;
  },

  obtenerPerfil: async () => {
    const response = await api.get('/perfil-adoptante');
    return response.data;
  },

  obtenerEspecies: async () => {
    const response = await api.get('/perfil-adoptante/especies');
    return response.data;
  },
};

// ✅ CORREGIDO: eliminado corr_refug del tipo y del llamado
export const refugioService = {
  guardarDatos: async (data: {
    nom_refug: string;
    dir_refug: string;
    telf_refug: string;
    licencia_refug: string;
    descripcion?: string;
  }) => {
    const response = await api.post('/refugios/datos', data);
    return response.data;
  },

  obtenerDatos: async () => {
    const response = await api.get('/refugios/datos');
    return response.data;
  },

  obtenerSolicitudes: async () => {
    const response = await api.get('/refugios/admin/solicitudes');
    return response.data;
  },

  cambiarEstado: async (id_refug: number, estado: 'aprobado' | 'rechazado') => {
    const response = await api.patch(`/refugios/admin/refugio/${id_refug}/estado`, { estado });
    return response.data;
  },
};

// Funciones de notificaciones
export const notificacionService = {
  obtenerNotificaciones: async () => {
    const response = await api.get('/notificaciones');
    return response.data;
  },

  obtenerNoLeidas: async () => {
    const response = await api.get('/notificaciones/no-leidas');
    return response.data;
  },

  marcarLeida: async (id_notif: number) => {
    const response = await api.patch(`/notificaciones/${id_notif}/leida`);
    return response.data;
  },

  marcarTodasLeidas: async () => {
    const response = await api.patch('/notificaciones/leer-todas');
    return response.data;
  },

  eliminar: async (id_notif: number) => {
    const response = await api.delete(`/notificaciones/${id_notif}`);
    return response.data;
  },
};

export default api;