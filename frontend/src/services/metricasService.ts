import type { MetricasRefugio } from '../types/metricas.types';

const PETS_BASE = import.meta.env.VITE_PETS_API_URL || 'http://localhost:3003';

export const metricasService = {
  getMetricasRefugio: async (id_refug: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${PETS_BASE}/metricas/refugio/${id_refug}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    return data as { success: boolean; message?: string; data?: MetricasRefugio };
  },
};

export default metricasService;