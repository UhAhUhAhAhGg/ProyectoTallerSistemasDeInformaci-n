import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const ADOPTIONS_BASE = import.meta.env.VITE_ADOPTIONS_API_URL || 'http://localhost:3004';

interface Solicitud {
  id_soli:       number;
  id_usuario:    number;
  id_publi:      number;
  id_est:        number;
  nom_est?:      string;
  fech_soli:     string;
  decrip_soli?:  string;
  nom_mascot?:   string;
  nom_usuario?:  string;
  apell_usuario?: string;
  corr_usuario?: string;
}

type Decision = 'aprobada' | 'rechazada' | 'completada';

const ESTADO_ID: Record<Decision, number> = {
  aprobada:   3,
  rechazada:  4,
  completada: 6,
};

const estadoColor: Record<string, string> = {
  enviada:       '#3b82f6',
  'en revisión': '#f59e0b',
  'en revision': '#f59e0b',
  aprobada:      '#22c55e',
  rechazada:     '#ef4444',
  completada:    '#6366f1',
  'en espera':   '#a855f7',
};

const MODAL_CONFIG: Record<Decision, { titulo: string; confirmar: string; color: string; placeholder: string }> = {
  aprobada: {
    titulo:      '✓ Aprobar solicitud',
    confirmar:   'Confirmar aprobación',
    color:       '#16a34a',
    placeholder: 'Ej: Bienvenido, te contactaremos pronto...',
  },
  rechazada: {
    titulo:      '✕ Rechazar solicitud',
    confirmar:   'Confirmar rechazo',
    color:       '#dc2626',
    placeholder: 'Ej: Lo sentimos, en este momento priorizamos otro perfil...',
  },
  completada: {
    titulo:      '🏠 Completar adopción',
    confirmar:   'Marcar como completada',
    color:       '#6366f1',
    placeholder: 'Ej: La adopción fue exitosa, el animal se adaptó perfectamente.',
  },
};

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function SolicitudesRefugioPage() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [modal, setModal] = useState<{
    solicitud: Solicitud;
    decision:  Decision;
  } | null>(null);
  const [motivo, setMotivo]         = useState('');
  const [accionando, setAccionando] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${ADOPTIONS_BASE}/solicitudes/refugio`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setSolicitudes(json.data ?? []);
    } catch {
      setError('No se pudieron cargar las solicitudes. Verifica que el servicio de adopciones esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (solicitud: Solicitud, decision: Decision) => {
    setModal({ solicitud, decision });
    setMotivo('');
  };

  const confirmarAccion = async () => {
    if (!modal) return;
    if (!motivo.trim()) { alert('El motivo es obligatorio'); return; }

    setAccionando(true);
    try {
      const res = await fetch(
        `${ADOPTIONS_BASE}/solicitudes/refugio/${modal.solicitud.id_soli}/estado`,
        {
          method:  'PATCH',
          headers: authHeaders(),
          body:    JSON.stringify({ id_est: ESTADO_ID[modal.decision], motivo: motivo.trim() }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error al ${modal.decision}`);
      }
      setModal(null);
      await cargar();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setAccionando(false);
    }
  };

  const getNombreCompleto = (s: Solicitud) =>
    [s.nom_usuario, s.apell_usuario].filter(Boolean).join(' ') || `Adoptante #${s.id_usuario}`;

  const getEstado = (s: Solicitud) => (s.nom_est ?? 'enviada').toLowerCase();

  const isPendiente = (s: Solicitud) => {
    const e = getEstado(s);
    return e === 'enviada' || e === 'en revisión' || e === 'en revision' || e === 'en espera';
  };

  const isAprobada = (s: Solicitud) => s.id_est === 3;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate('/dashboard/refugio')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}
        >
          ← Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          📋 Solicitudes de Adopción
        </h1>
      </div>

      <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
        {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando solicitudes...</p>}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!loading && solicitudes.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>No hay solicitudes de adopción todavía.</p>
          </div>
        )}

        {solicitudes.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Mascota', 'Adoptante', 'Mensaje', 'Fecha', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s, i) => {
                  const est   = getEstado(s);
                  const color = estadoColor[est] ?? '#94a3b8';
                  return (
                    <tr key={s.id_soli} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>
                        {s.nom_mascot ?? `Publicación #${s.id_publi}`}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        <div>{getNombreCompleto(s)}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.corr_usuario ?? ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 13, fontStyle: 'italic', maxWidth: 200 }}>
                        {s.decrip_soli
                          ? `"${s.decrip_soli.slice(0, 80)}${s.decrip_soli.length > 80 ? '…' : ''}"`
                          : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 13 }}>
                        {new Date(s.fech_soli).toLocaleDateString('es-BO')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: color + '20', color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                          {est}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isPendiente(s) && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => abrirModal(s, 'aprobada')}
                              style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => abrirModal(s, 'rechazada')}
                              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                            >
                              ✕ Rechazar
                            </button>
                          </div>
                        )}
                        {isAprobada(s) && (
                          <button
                            onClick={() => abrirModal(s, 'completada')}
                            style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                          >
                            🏠 Completar
                          </button>
                        )}
                        {!isPendiente(s) && !isAprobada(s) && (
                          <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {modal && (() => {
        const cfg = MODAL_CONFIG[modal.decision];
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                {cfg.titulo}
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
                Mascota: <strong>{modal.solicitud.nom_mascot ?? `Publicación #${modal.solicitud.id_publi}`}</strong><br />
                Adoptante: <strong>{getNombreCompleto(modal.solicitud)}</strong>
              </p>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Mensaje para el adoptante *
              </label>
              <textarea
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder={cfg.placeholder}
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                  onClick={() => setModal(null)}
                  disabled={accionando}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAccion}
                  disabled={accionando || !motivo.trim()}
                  style={{ flex: 2, background: cfg.color, color: '#fff', border: 'none', borderRadius: 8, padding: 12, cursor: accionando || !motivo.trim() ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: accionando || !motivo.trim() ? 0.6 : 1 }}
                >
                  {accionando ? 'Procesando...' : cfg.confirmar}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}