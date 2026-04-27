import axios from 'axios'
import type { AnimalFormData, EstadoAnimal, Publicacion, Raza, Especie } from './animal.types'

const api = axios.create({ baseURL: import.meta.env.VITE_PETS_API_URL || 'http://localhost:3003/api' })

// Inyectar token en cada request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const getRazas = (): Promise<Raza[]> =>
  api.get('/razas').then(r => r.data.data)

export const getEspecies = (): Promise<Especie[]> =>
  api.get('/especies').then(r => r.data.data)

export const registrarAnimal = (form: AnimalFormData, id_refug: number) =>
  api.post('/animales', { ...form, id_refug }).then(r => r.data.data)

export const editarAnimal = (id_mascot: number, form: Partial<AnimalFormData>) =>
  api.put(`/animales/${id_mascot}`, form).then(r => r.data.data)

const estadoAFlags: Record<EstadoAnimal, { est_adop: boolean; est_publi: boolean }> = {
  disponible:     { est_adop: false, est_publi: true  },
  en_proceso:     { est_adop: true,  est_publi: true  },
  adoptado:       { est_adop: true,  est_publi: false },
  en_tratamiento: { est_adop: false, est_publi: false },
}
export const cambiarEstado = (id_publi: number, estado: EstadoAnimal) =>
  api.patch(`/publicaciones/${id_publi}/estado`, estadoAFlags[estado]).then(r => r.data.data)

export const darDeBaja = (id_publi: number, motivo: string) =>
  api.patch(`/publicaciones/${id_publi}/baja`, {
    est_publi: false,
    fech_baja: new Date().toISOString(),
    motivo,
  }).then(r => r.data.data)

// Listar publicaciones del refugio 
export const getPublicacionesRefugio = (id_refug: number): Promise<Publicacion[]> =>
  api.get(`/publicaciones?id_refug=${id_refug}`).then(r => r.data.data)