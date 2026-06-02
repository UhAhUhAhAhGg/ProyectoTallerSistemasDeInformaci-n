import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { MetricasRefugio } from '../../types/metricas.types';

const COLORS = ['#48bb78', '#f6ad55', '#f56565'];

type Props = { metricas: MetricasRefugio };

export default function AdopcionesChart({ metricas }: Props) {
  const data = [
    { name: 'Aprobadas', value: metricas.solicitudes_aprobadas },
    { name: 'Pendientes', value: metricas.solicitudes_pendientes },
    { name: 'Rechazadas', value: metricas.solicitudes_rechazadas },
  ];

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
