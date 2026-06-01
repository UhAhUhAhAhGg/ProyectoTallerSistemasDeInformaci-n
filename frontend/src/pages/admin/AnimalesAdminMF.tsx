import React, { useCallback, useEffect, useState } from 'react';

const PETS_URL = import.meta.env.VITE_PETS_URL || 'http://localhost:3003';

interface PublicacionAdmin {
  id_publi: number;
  id_mascot: number;
  id_refug: number;
  nom_mascot: string;
  nom_espe: string;
  nom_raza: string;
  edad_mascot: number;
  nom_refug: string;
  est_publi: boolean;
  est_adop: boolean;
  fech_publi: string;
  img_mascot?: string;
  arch_publi?: string;
  decrip_publi?: string;
}

const PETS_API = `${PETS_URL}`;

const AnimalesAdminMF: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<PublicacionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'inactivas'>('todas');

  const token = localStorage.getItem('token');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PETS_API}/catalogo?limite=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPublicaciones(Array.isArray(data.data) ? data.data : []);
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las publicaciones.' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (id_publi: number, activar: boolean) => {
    setProcesando(id_publi);
    setMensaje(null);
    try {
      const res = await fetch(`${PETS_API}/publicaciones/${id_publi}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ est_publi: activar }),
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      setPublicaciones((prev) =>
        prev.map((p) => p.id_publi === id_publi ? { ...p, est_publi: activar } : p)
      );
      setMensaje({ tipo: 'ok', texto: `Publicación ${activar ? 'activada' : 'desactivada'} correctamente.` });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo cambiar el estado de la publicación.' });
    } finally {
      setProcesando(null);
    }
  };

  const filtradas = publicaciones.filter((p) => {
    if (filtro === 'activas') return p.est_publi;
    if (filtro === 'inactivas') return !p.est_publi;
    return true;
  });

  if (loading) return <p style={{ padding: 20 }}>Cargando publicaciones...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0 }}>Moderación de Animales</h2>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>
            Activa o desactiva publicaciones de mascotas en el catálogo.
          </p>
        </div>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}>
          <option value="todas">Todas ({publicaciones.length})</option>
          <option value="activas">Activas ({publicaciones.filter((p) => p.est_publi).length})</option>
          <option value="inactivas">Inactivas ({publicaciones.filter((p) => !p.est_publi).length})</option>
        </select>
      </div>

      {mensaje && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16,
          background: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
          color: mensaje.tipo === 'ok' ? '#166534' : '#991b1b', fontSize: 14 }}>
          {mensaje.texto}
        </div>
      )}

      {filtradas.length === 0 && (
        <p style={{ color: '#6b7280', padding: 20 }}>No hay publicaciones en esta categoría.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {filtradas.map((p) => (
          <div key={p.id_publi} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 16,
            border: '1px solid #e5e7eb', borderRadius: 10,
            background: p.est_publi ? '#fff' : '#f9fafb',
            opacity: p.est_publi ? 1 : 0.7,
          }}>
            {(p.img_mascot || p.arch_publi) && (
              <img src={p.img_mascot || p.arch_publi} alt={p.nom_mascot}
                style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 15 }}>{p.nom_mascot}</strong>
              <span style={{ marginLeft: 8, fontSize: 13, color: '#6b7280' }}>
                {p.nom_espe} · {p.nom_raza} · {p.edad_mascot} años
              </span>
              <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>
                Refugio: {p.nom_refug}
                {' · '}
                <span style={{ color: p.est_adop ? '#16a34a' : '#6b7280' }}>
                  {p.est_adop ? 'Adoptado' : 'Disponible'}
                </span>
              </div>
              {p.decrip_publi && (
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.decrip_publi}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: p.est_publi ? '#dcfce7' : '#fee2e2',
                color: p.est_publi ? '#166534' : '#991b1b',
              }}>
                {p.est_publi ? 'Activa' : 'Inactiva'}
              </span>
              <button
                disabled={procesando === p.id_publi || p.est_adop}
                onClick={() => cambiarEstado(p.id_publi, !p.est_publi)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 13,
                  background: p.est_publi ? '#dc2626' : '#16a34a', color: '#fff',
                  opacity: (procesando === p.id_publi || p.est_adop) ? 0.5 : 1,
                }}
                title={p.est_adop ? 'Esta mascota ya fue adoptada' : undefined}
              >
                {procesando === p.id_publi ? '...' : p.est_publi ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalesAdminMF;