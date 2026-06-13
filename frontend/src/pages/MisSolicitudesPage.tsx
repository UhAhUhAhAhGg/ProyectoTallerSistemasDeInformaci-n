import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADOPTIONS_BASE = import.meta.env.VITE_ADOPTIONS_API_URL || 'http://localhost:3004';

interface Solicitud {
  id_soli?:        number;
  id_solic?:       number;
  id_solicitud?:   number;
  nom_anim?:       string;
  nombre_mascota?: string;
  nom_mascot?:     string;
  nom_refug?:      string;
  nombre_refugio?: string;
  est_solic?:      string;
  nom_est?:        string;
  estado?:         string;
  fech_soli?:      string;
  fech_solic?:     string;
  fecha_solicitud?: string;
  decrip_soli?:   string;
}

interface HistorialEntry {
  id_ha:            number;
  nom_est_anterior: string;
  nom_est_nuevo:    string;
  motivo:           string;
  fech_cambio:      string;
}

const estadoConfig: Record<string, { color: string; label: string; icon: string }> = {
  enviada:       { color: '#f59e0b', label: 'Enviada',      icon: '📤' },
  'en revisión': { color: '#3b82f6', label: 'En revisión',  icon: '🔍' },
  pendiente:     { color: '#f59e0b', label: 'Pendiente',    icon: '⏳' },
  aprobada:      { color: '#22c55e', label: 'Aprobada',     icon: '✅' },
  rechazada:     { color: '#ef4444', label: 'Rechazada',    icon: '❌' },
  completada:    { color: '#6366f1', label: 'Completada',   icon: '🏠' },
  'en espera':   { color: '#a855f7', label: 'En espera',    icon: '⏳' },
};

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function MisSolicitudesPage() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes]         = useState<Solicitud[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [expandedId, setExpandedId]           = useState<number | null>(null);
  const [historial, setHistorial]             = useState<Record<number, HistorialEntry[]>>({});
  const [loadingHist, setLoadingHist]         = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${ADOPTIONS_BASE}/solicitudes/mis`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setSolicitudes(json.data ?? json ?? []);
      } catch (err: unknown) {
        setError('No se pudieron cargar tus solicitudes.');
        console.error('[MisSolicitudesPage]', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getId    = (s: Solicitud) => s.id_soli ?? s.id_solic ?? s.id_solicitud ?? 0;
  const getMasc  = (s: Solicitud) => s.nom_mascot ?? s.nom_anim ?? s.nombre_mascota ?? '—';
  const getRefug = (s: Solicitud) => s.nom_refug ?? s.nombre_refugio ?? '—';
  const getEst   = (s: Solicitud) => (s.nom_est ?? s.est_solic ?? s.estado ?? 'enviada').toLowerCase();
  const getFecha = (s: Solicitud) => {
    const f = s.fech_soli ?? s.fech_solic ?? s.fecha_solicitud;
    return f ? new Date(f).toLocaleDateString('es-BO') : '—';
  };

  const toggleHistorial = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (historial[id]) return;

    setLoadingHist(id);
    try {
      const res = await fetch(`${ADOPTIONS_BASE}/solicitudes/${id}/historial`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setHistorial((prev) => ({ ...prev, [id]: json.data ?? json ?? [] }));
    } catch {
      setHistorial((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingHist(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={() => navigate('/dashboard/adoptante')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}
        >
          ← Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          🐾 Mis Solicitudes de Adopción
        </h1>
      </div>

      <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
        {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando tus solicitudes...</p>}

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!loading && !error && solicitudes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐶</div>
            <p style={{ fontSize: 16 }}>Aún no has enviado solicitudes de adopción.</p>
            <button
              onClick={() => navigate('/catalogo')}
              style={{
                marginTop: 16, background: '#6366f1', color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 24px',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              Ver catálogo de mascotas
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {solicitudes.map((s) => {
            const id     = getId(s);
            const est    = getEst(s);
            const config = estadoConfig[est] ?? { color: '#94a3b8', label: est, icon: '•' };
            const expanded = expandedId === id;

            return (
              <div
                key={id}
                style={{
                  background: '#fff', borderRadius: 12,
                  border: '1px solid #e2e8f0', overflow: 'hidden',
                }}
              >
                {/* Fila principal */}
                <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>🐾</span>
                      <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{getMasc(s)}</span>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Refugio: {getRefug(s)}</p>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Enviada el {getFecha(s)}</p>
                    {s.decrip_soli && (
                      <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>
                        "{s.decrip_soli}"
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span style={{
                      background: config.color + '20', color: config.color,
                      padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                      {config.icon} {config.label}
                    </span>
                    <button
                      onClick={() => toggleHistorial(id)}
                      style={{
                        background: 'none', border: '1px solid #e2e8f0',
                        borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                        fontSize: 12, color: '#64748b',
                      }}
                    >
                      {expanded ? '▲ Ocultar historial' : '▼ Ver historial'}
                    </button>
                  </div>
                </div>

                {/* Panel de historial */}
                {expanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px', background: '#f8fafc' }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                      Historial de cambios
                    </p>
                    {loadingHist === id && <p style={{ fontSize: 13, color: '#94a3b8' }}>Cargando...</p>}
                    {!loadingHist && (historial[id] ?? []).length === 0 && (
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>Sin cambios de estado registrados.</p>
                    )}
                    {(historial[id] ?? []).map((h) => (
                      <div
                        key={h.id_ha}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          marginBottom: 10, fontSize: 13,
                        }}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', background: '#6366f1',
                          flexShrink: 0, marginTop: 4,
                        }} />
                        <div>
                          <span style={{ color: '#374151' }}>
                            <strong>{h.nom_est_anterior}</strong>
                            {' → '}
                            <strong style={{ color: '#4f46e5' }}>{h.nom_est_nuevo}</strong>
                          </span>
                          {h.motivo && (
                            <span style={{ color: '#6b7280', marginLeft: 6 }}>— {h.motivo}</span>
                          )}
                          <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: 11 }}>
                            {new Date(h.fech_cambio).toLocaleString('es-BO')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}