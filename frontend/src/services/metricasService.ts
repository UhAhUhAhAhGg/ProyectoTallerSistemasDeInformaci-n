import api from './api';
import { MetricasRefugio } from '../types/metricas.types';

export const metricasService = {
  getMetricasRefugio: async (id_refug: number) => {
    const response = await api.get(`/metricas/refugio/${id_refug}`);
    // la API usa el formato { success, message, data }
    return response.data as { success: boolean; message?: string; data?: MetricasRefugio };
  },
};

export default metricasService;
