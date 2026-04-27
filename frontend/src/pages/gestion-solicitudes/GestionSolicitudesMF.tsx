import { useEffect, useState } from 'react';
import { solicitudService } from './shared/solicitud.service';
import type { Solicitud, EstadoSolicitud } from './shared/solicitud.types';

interface Props { id_refu: number }

const ACCIONES: { est: EstadoSolicitud; label: string; color: string }[] = [
  { est: 'aprobada',    label: 'Aprobar',        color: '#16a34a' },
  { est: 'rechazada',   label: 'Rechazar',        color: '#dc2626' },
  { est: 'en_espera',   label: 'Poner en espera', color: '#7c3aed' },
  { est: 'en_revision', label: 'Marcar en revisión', color: '#d97706' },
];

export default function GestionSolicitudesMF({ id_refu }: Props) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivos, setMotivos] = useState<Record<number, string>>({});
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    solicitudService.porRefugio(id_refu)
      .then(setSolicitudes)
      .finally(() => setLoading(false));
  }, [id_refu]);

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
      {solicitudes.map(s => (
        <div key={s.id_soli} style={{ border: '1px solid #e5e7eb', borderRadius: 10,
          padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{s.nom_adop ?? `Adoptante #${s.id_adop}`}</strong>
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                → {s.nom_animal ?? `Publicación #${s.id_publ}`}
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
              {s.est_soli.replace('_', ' ')}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0' }}>
            {new Date(s.fec_soli).toLocaleDateString('es-BO')}
          </p>
          <textarea
            rows={2}
            placeholder="Motivo de la decisión (requerido para rechazar/aprobar)..."
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
          </div>
        </div>
      ))}
    </div>
  );
}