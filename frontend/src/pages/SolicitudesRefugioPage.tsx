// frontend/src/pages/SolicitudesRefugioPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADOPTIONS_BASE = import.meta.env.VITE_ADOPTIONS_API_URL || 'http://localhost:3004';

interface Solicitud {
  id_solic?: number;
  id_solicitud?: number;
  nom_anim?: string;
  nombre_mascota?: string;
  nom_usuario?: string;
  nombre_adoptante?: string;
  corr_usuario?: string;
  correo?: string;
  est_solic?: string;
  estado?: string;
  fech_solic?: string;
  fecha_solicitud?: string;
}

const estadoColor: Record<string, string> = {
  pendiente:  '#f59e0b',
  aprobada:   '#22c55e',
  rechazada:  '#ef4444',
  completada: '#6366f1',
};

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function SolicitudesRefugioPage() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [accionando, setAccionando]   = useState<number | null>(null);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ADOPTIONS_BASE}/solicitudes/refugio`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Error al cargar solicitudes');
      const json = await res.json();
      setSolicitudes(json.data ?? json ?? []);
    } catch {
      setError('No se pudieron cargar las solicitudes. Verifica que el servicio de adopciones esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const accion = async (id: number, accion: 'aprobar' | 'rechazar') => {
    setAccionando(id);
    try {
      const res = await fetch(`${ADOPTIONS_BASE}/solicitudes/${id}/${accion}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error al ${accion}`);
      await cargar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setAccionando(null);
    }
  };

  const getId    = (s: Solicitud) => s.id_solic ?? s.id_solicitud ?? 0;
  const getMasc  = (s: Solicitud) => s.nom_anim ?? s.nombre_mascota ?? '—';
  const getAdopt = (s: Solicitud) => s.nom_usuario ?? s.nombre_adoptante ?? '—';
  const getCorr  = (s: Solicitud) => s.corr_usuario ?? s.correo ?? '—';
  const getEst   = (s: Solicitud) => s.est_solic ?? s.estado ?? 'pendiente';
  const getFecha = (s: Solicitud) => {
    const f = s.fech_solic ?? s.fecha_solicitud;
    return f ? new Date(f).toLocaleDateString('es-BO') : '—';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/dashboard/refugio')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>📋 Solicitudes de Adopción</h1>
      </div>

      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
        {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando solicitudes...</p>}
        {error   && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        {!loading && solicitudes.length === 0 && (
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
                  {['Mascota', 'Adoptante', 'Correo', 'Fecha', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s, i) => {
                  const id    = getId(s);
                  const est   = getEst(s);
                  const isPend = est === 'pendiente';
                  return (
                    <tr key={id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{getMasc(s)}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{getAdopt(s)}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: 13 }}>{getCorr(s)}</td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 13 }}>{getFecha(s)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: (estadoColor[est] ?? '#94a3b8') + '20',
                          color: estadoColor[est] ?? '#94a3b8',
                          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        }}>
                          {est}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isPend ? (
                          <>
                            <button
                              onClick={() => accion(id, 'aprobar')}
                              disabled={accionando === id}
                              style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginRight: 8 }}
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => accion(id, 'rechazar')}
                              disabled={accionando === id}
                              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
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
    </div>
  );
}
