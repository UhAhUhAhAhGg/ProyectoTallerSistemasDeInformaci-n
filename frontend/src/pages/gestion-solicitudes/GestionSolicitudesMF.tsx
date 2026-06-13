import { useEffect, useState } from 'react';
import { solicitudService } from './shared/solicitud.service';
import type { EstadoSolicitud, Solicitud } from './shared/solicitud.types';

const ACCIONES: { est: EstadoSolicitud; label: string; color: string }[] = [
  { est: 'aprobada',    label: 'Aprobar',           color: '#16a34a' },
  { est: 'rechazada',   label: 'Rechazar',           color: '#dc2626' },
  { est: 'en_espera',   label: 'Poner en espera',    color: '#7c3aed' },
  { est: 'en_revision', label: 'Marcar en revisión', color: '#d97706' },
];

const ESTADOS: Record<number, EstadoSolicitud> = {
  1: 'enviada',
  2: 'en_revision',
  3: 'aprobada',
  4: 'rechazada',
  5: 'en_espera',
  6: 'completada',
};

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  enviada:     'Enviada',
  en_revision: 'En revisión',
  aprobada:    'Aprobada',
  rechazada:   'Rechazada',
  en_espera:   'En espera',
  completada:  'Completada',
};

export default function GestionSolicitudesMF() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivos, setMotivos] = useState<Record<number, string>>({});
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    solicitudService.porRefugio()
      .then(setSolicitudes)
      .finally(() => setLoading(false));
  }, []);

  const handleAccion = async (s: Solicitud, est: EstadoSolicitud) => {
    setProcesando(s.id_soli);
    try {
      const updated = await solicitudService.actualizarEstado(
        s.id_soli, est, motivos[s.id_soli]
      );
      setSolicitudes(prev => prev.map(x => x.id_soli === s.id_soli ? updated : x));
    } finally {
      setProcesando(null);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando solicitudes...</p>;
  if (!solicitudes.length) return (
    <p style={{ padding: 20, color: '#555' }}>No hay solicitudes recibidas aún.</p>
  );

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>Solicitudes de adopción recibidas</h3>
      {solicitudes.map(s => {
        const estadoKey = ESTADOS[s.id_est] ?? 'enviada';
        const esCompletada = estadoKey === 'completada';
        return (
          <div key={s.id_soli} style={{ border: '1px solid #e5e7eb', borderRadius: 10,
            padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{s.nom_usuario ?? `Adoptante #${s.id_usuario}`}</strong>
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                  → {s.nom_mascot ?? `Publicación #${s.id_publi}`}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                {ESTADO_LABEL[estadoKey]}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0' }}>
              {new Date(s.fech_soli).toLocaleDateString('es-BO')}
            </p>
            {!esCompletada && (
              <>
                <textarea
                  rows={2}
                  placeholder="Motivo de la decisión..."
                  value={motivos[s.id_soli] ?? ''}
                  onChange={e => setMotivos(prev => ({ ...prev, [s.id_soli]: e.target.value }))}
                  style={{ width: '100%', padding: 8, borderRadius: 6,
                    border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', marginTop: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {ACCIONES.map(a => (
                    <button key={a.est} disabled={procesando === s.id_soli}
                      onClick={() => handleAccion(s, a.est)}
                      style={{ padding: '6px 14px', borderRadius: 6, border: 'none',
                        background: a.color, color: '#fff', cursor: 'pointer', fontSize: 13,
                        fontWeight: 600, opacity: procesando === s.id_soli ? 0.6 : 1 }}>
                      {a.label}
                    </button>
                  ))}
                  {estadoKey === 'aprobada' && (
                    <button
                      disabled={procesando === s.id_soli}
                      onClick={() => handleAccion(s, 'completada')}
                      style={{ padding: '6px 14px', borderRadius: 6, border: 'none',
                        background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13,
                        fontWeight: 600, opacity: procesando === s.id_soli ? 0.6 : 1 }}>
                      ✓ Marcar completada
                    </button>
                  )}
                </div>
              </>
            )}
            {esCompletada && (
              <p style={{ fontSize: 12, color: '#6366f1', marginTop: 8, fontWeight: 600 }}>
                ✓ Adopción completada exitosamente
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}