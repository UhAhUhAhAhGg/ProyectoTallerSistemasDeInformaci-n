import { useEffect, useState } from 'react';
import { solicitudService } from './shared/solicitud.service';
import type { EstadoSolicitud, Solicitud } from './shared/solicitud.types';

interface Props { id_adop: number }

const BADGE: Record<EstadoSolicitud, { label: string; color: string; bg: string }> = {
  enviada:     { label: 'Enviada',     color: '#1d4ed8', bg: '#dbeafe' },
  en_revision: { label: 'En revisión', color: '#92400e', bg: '#fef3c7' },
  aprobada:    { label: 'Aprobada',    color: '#065f46', bg: '#d1fae5' },
  rechazada:   { label: 'Rechazada',   color: '#991b1b', bg: '#fee2e2' },
  en_espera:   { label: 'En espera',   color: '#6b21a8', bg: '#f3e8ff' },
};

const ESTADOS: Record<number, EstadoSolicitud> = {
  1: 'enviada',
  2: 'en_revision',
  3: 'aprobada',
  4: 'rechazada',
  5: 'en_espera',
};

export default function HistorialSolicitudesMF({ id_adop }: Props) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    solicitudService.porAdoptante(id_adop)
      .then(setSolicitudes)
      .catch(() => setError('No se pudo cargar tu historial.'))
      .finally(() => setLoading(false));
  }, [id_adop]);

  if (loading) return <p style={{ padding: 20 }}>Cargando historial...</p>;
  if (error) return <p style={{ padding: 20, color: 'red' }}>{error}</p>;
  if (!solicitudes.length) return (
    <p style={{ padding: 20, color: '#555' }}>Aún no has enviado ninguna solicitud.</p>
  );

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>Mis solicitudes de adopción</h3>
      {solicitudes.map((s: Solicitud) => {
        const estado = ESTADOS[s.id_est] ?? 'enviada';
        const badge = BADGE[estado];
        return (
          <div key={s.id_soli} style={{ border: '1px solid #e5e7eb', borderRadius: 10,
            padding: 16, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 15 }}>{s.nom_animal ?? `Publicación #${s.id_publi}`}</strong>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20,
                  fontWeight: 600, color: badge.color, background: badge.bg }}>
                  {badge.label}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0' }}>
                Enviada el {new Date(s.fech_soli).toLocaleDateString('es-BO')}
              </p>
              {s.decrip_soli && (
                <p style={{ fontSize: 13, color: '#374151', marginTop: 6,
                  background: '#f9fafb', padding: '6px 10px', borderRadius: 6 }}>
                  <em>Descripción: {s.decrip_soli}</em>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
