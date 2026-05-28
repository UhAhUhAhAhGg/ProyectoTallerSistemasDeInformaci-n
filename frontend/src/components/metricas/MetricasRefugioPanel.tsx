import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import AdopcionesChart from './AdopcionesChart';
import { metricasService } from '../../services/metricasService';
import { MetricasRefugio } from '../../types/metricas.types';

type Props = { idRefug: number };

export default function MetricasRefugioPanel({ idRefug }: Props) {
  const [metricas, setMetricas] = useState<MetricasRefugio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    metricasService.getMetricasRefugio(idRefug)
      .then((res) => {
        if (mounted && res?.success && res.data) setMetricas(res.data);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [idRefug]);

  if (loading) return <div style={{ padding: 12 }}>Cargando métricas...</div>;
  if (!metricas) return <div style={{ padding: 12 }}>No hay métricas disponibles.</div>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <StatCard label="Publicaciones activas" value={metricas.total_publicaciones_activas} />
        <StatCard label="Animales adoptados" value={metricas.total_animales_adoptados} />
        <StatCard label="Solicitudes totales" value={metricas.total_solicitudes_recibidas} />
        <StatCard label="Tasa de adopción" value={metricas.tasa_adopcion} suffix="%" />
        <StatCard label="Solicitudes pendientes" value={metricas.solicitudes_pendientes} />
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 12 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Solicitudes por estado</h4>
        <AdopcionesChart metricas={metricas} />
      </div>
    </div>
  );
}
