// frontend/src/pages/MisSolicitudesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADOPTIONS_BASE = import.meta.env.VITE_ADOPTIONS_API_URL || 'http://localhost:3004';

interface Solicitud {
  id_solic?: number;
  id_solicitud?: number;
  nom_anim?: string;
  nombre_mascota?: string;
  nom_refug?: string;
  nombre_refugio?: string;
  est_solic?: string;
  estado?: string;
  fech_solic?: string;
  fecha_solicitud?: string;
}

const estadoConfig: Record<string, { color: string; label: string; icon: string }> = {
  pendiente:  { color: '#f59e0b', label: 'Pendiente',  icon: '⏳' },
  aprobada:   { color: '#22c55e', label: 'Aprobada',   icon: '✅' },
  rechazada:  { color: '#ef4444', label: 'Rechazada',  icon: '❌' },
  completada: { color: '#6366f1', label: 'Completada', icon: '🏠' },
};

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function MisSolicitudesPage() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${ADOPTIONS_BASE}/solicitudes/mis-solicitudes`, { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setSolicitudes(json.data ?? json ?? []);
      } catch {
        setError('No se pudieron cargar tus solicitudes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getId    = (s: Solicitud) => s.id_solic ?? s.id_solicitud ?? 0;
  const getMasc  = (s: Solicitud) => s.nom_anim ?? s.nombre_mascota ?? '—';
  const getRefug = (s: Solicitud) => s.nom_refug ?? s.nombre_refugio ?? '—';
  const getEst   = (s: Solicitud) => s.est_solic ?? s.estado ?? 'pendiente';
  const getFecha = (s: Solicitud) => {
    const f = s.fech_solic ?? s.fecha_solicitud;
    return f ? new Date(f).toLocaleDateString('es-BO') : '—';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/dashboard/adoptante')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>🐾 Mis Solicitudes de Adopción</h1>
      </div>

      <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
        {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando tus solicitudes...</p>}
        {error   && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        {!loading && solicitudes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐶</div>
            <p style={{ fontSize: 16 }}>Aún no has enviado solicitudes de adopción.</p>
            <button
              onClick={() => navigate('/catalogo')}
              style={{ marginTop: 16, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}
            >
              Ver catálogo de mascotas
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {solicitudes.map((s) => {
            const est    = getEst(s);
            const config = estadoConfig[est] ?? { color: '#94a3b8', label: est, icon: '•' };
            return (
              <div key={getId(s)} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>🐾</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{getMasc(s)}</span>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Refugio: {getRefug(s)}</p>
                  <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Enviada el {getFecha(s)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: config.color + '20',
                    color: config.color,
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    {config.icon} {config.label}
                  </span>
                  {est === 'aprobada' && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#22c55e' }}>El refugio se pondrá en contacto contigo.</p>
                  )}
                  {est === 'rechazada' && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#ef4444' }}>Tu solicitud no fue aceptada esta vez.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
