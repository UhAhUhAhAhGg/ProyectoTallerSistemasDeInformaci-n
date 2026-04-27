// frontend/src/pages/NotificacionesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTH_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Notificacion {
  id_noti?: number;
  id_notificacion?: number;
  tit_noti?: string;
  titulo?: string;
  desc_noti?: string;
  descripcion?: string;
  fech_noti?: string;
  fecha?: string;
  leida?: boolean;
  est_noti?: string;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function getRolDashboard() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '/login';
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.rol === 'refugio')  return '/dashboard/refugio';
    if (payload.rol === 'administrador') return '/admin/dashboard';
    return '/dashboard/adoptante';
  } catch {
    return '/login';
  }
}

export default function NotificacionesPage() {
  const navigate = useNavigate();
  const [notis, setNotis]     = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${AUTH_BASE}/notificaciones`, { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setNotis(json.data ?? json ?? []);
      } catch {
        // Si el endpoint no existe aún, mostrar estado vacío sin error ruidoso
        setNotis([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getId    = (n: Notificacion) => n.id_noti ?? n.id_notificacion ?? 0;
  const getTitulo = (n: Notificacion) => n.tit_noti ?? n.titulo ?? 'Notificación';
  const getDesc  = (n: Notificacion) => n.desc_noti ?? n.descripcion ?? '';
  const getFecha = (n: Notificacion) => {
    const f = n.fech_noti ?? n.fecha;
    return f ? new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  };
  const isLeida = (n: Notificacion) => n.leida === true || n.est_noti === 'leida';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(getRolDashboard())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}>
          ← Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>🔔 Notificaciones</h1>
        {notis.filter(n => !isLeida(n)).length > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
            {notis.filter(n => !isLeida(n)).length} nuevas
          </span>
        )}
      </div>

      <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
        {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando notificaciones...</p>}
        {error   && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8 }}>{error}</div>}

        {!loading && notis.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
            <p style={{ fontSize: 16 }}>No tienes notificaciones por ahora.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notis.map((n) => {
            const leida = isLeida(n);
            return (
              <div
                key={getId(n)}
                style={{
                  background: leida ? '#fff' : '#eff6ff',
                  border: `1px solid ${leida ? '#e2e8f0' : '#bfdbfe'}`,
                  borderRadius: 12, padding: '18px 20px',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 24, marginTop: 2 }}>🔔</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ fontWeight: leida ? 500 : 700, color: '#1e293b', fontSize: 15 }}>{getTitulo(n)}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 12 }}>{getFecha(n)}</span>
                  </div>
                  {getDesc(n) && <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>{getDesc(n)}</p>}
                </div>
                {!leida && (
                  <div style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', marginTop: 6, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}