// frontend/src/pages/GestionMascotasPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAnimalesRefugio,
  crearAnimal,
  actualizarAnimal,
  eliminarAnimal,
  getEspecies,
  getRazas,
} from '../services/pets.service';

interface Animal {
  id_anim: number;
  nom_anim: string;
  fech_nac_anim?: string;
  desc_anim?: string;
  est_anim: string;
  nom_espe?: string;
  nom_raza?: string;
  id_espe?: number;
  id_raza?: number;
}

interface Especie {
  id_espe: number;
  nom_espe: string;
}

interface Raza {
  id_raza: number;
  nom_raza: string;
}

const estadoColor: Record<string, string> = {
  disponible: '#22c55e',
  en_proceso: '#f59e0b',
  adoptado:   '#6366f1',
  inactivo:   '#94a3b8',
};

export default function GestionMascotasPage() {
  const navigate = useNavigate();
  const [animales, setAnimales]     = useState<Animal[]>([]);
  const [especies, setEspecies]     = useState<Especie[]>([]);
  const [razas, setRazas]           = useState<Raza[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editando, setEditando]     = useState<Animal | null>(null);
  const [form, setForm]             = useState({
    nom_anim: '', fech_nac_anim: '', desc_anim: '',
    est_anim: 'disponible', id_espe: '', id_raza: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [a, e] = await Promise.all([getAnimalesRefugio(), getEspecies()]);
      setAnimales(a);
      setEspecies(e);
    } catch {
      setError('Error al cargar datos. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (form.id_espe) {
      getRazas(Number(form.id_espe)).then(setRazas).catch(() => setRazas([]));
    } else {
      setRazas([]);
    }
  }, [form.id_espe]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nom_anim: '', fech_nac_anim: '', desc_anim: '', est_anim: 'disponible', id_espe: '', id_raza: '' });
    setShowModal(true);
  };

  const abrirEditar = (a: Animal) => {
    setEditando(a);
    setForm({
      nom_anim: a.nom_anim,
      fech_nac_anim: a.fech_nac_anim?.slice(0, 10) ?? '',
      desc_anim: a.desc_anim ?? '',
      est_anim: a.est_anim,
      id_espe: a.id_espe ? String(a.id_espe) : '',
      id_raza: a.id_raza ? String(a.id_raza) : '',
    });
    setShowModal(true);
  };

  const guardar = async () => {
    if (!form.nom_anim.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        id_espe: form.id_espe ? Number(form.id_espe) : undefined,
        id_raza: form.id_raza ? Number(form.id_raza) : undefined,
      };
      if (editando) {
        await actualizarAnimal(editando.id_anim, payload);
      } else {
        await crearAnimal(payload);
      }
      setShowModal(false);
      await cargar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const eliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await eliminarAnimal(id);
      await cargar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard/refugio')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}>
            ← Volver
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>🐾 Gestión de Mascotas</h1>
        </div>
        <button
          onClick={abrirCrear}
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          + Agregar mascota
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
        {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>Cargando...</p>}
        {error  && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        {!loading && animales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐶</div>
            <p style={{ fontSize: 16 }}>No hay mascotas registradas todavía.</p>
            <button onClick={abrirCrear} style={{ marginTop: 16, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>
              Registrar primera mascota
            </button>
          </div>
        )}

        {/* Tabla */}
        {animales.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nombre', 'Especie', 'Raza', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {animales.map((a, i) => (
                  <tr key={a.id_anim} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{a.nom_anim}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.nom_espe ?? '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.nom_raza ?? '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: (estadoColor[a.est_anim] ?? '#94a3b8') + '20',
                        color: estadoColor[a.est_anim] ?? '#94a3b8',
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      }}>
                        {a.est_anim}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => abrirEditar(a)} style={{ background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginRight: 8 }}>
                        Editar
                      </button>
                      <button onClick={() => eliminar(a.id_anim, a.nom_anim)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              {editando ? 'Editar mascota' : 'Nueva mascota'}
            </h2>

            <label style={lblStyle}>Nombre *</label>
            <input value={form.nom_anim} onChange={e => setForm(f => ({ ...f, nom_anim: e.target.value }))} style={inputStyle} placeholder="Ej: Luna" />

            <label style={lblStyle}>Especie</label>
            <select value={form.id_espe} onChange={e => setForm(f => ({ ...f, id_espe: e.target.value, id_raza: '' }))} style={inputStyle}>
              <option value="">Seleccionar</option>
              {especies.map(e => <option key={e.id_espe} value={e.id_espe}>{e.nom_espe}</option>)}
            </select>

            <label style={lblStyle}>Raza</label>
            <select value={form.id_raza} onChange={e => setForm(f => ({ ...f, id_raza: e.target.value }))} style={inputStyle} disabled={!form.id_espe}>
              <option value="">Seleccionar</option>
              {razas.map(r => <option key={r.id_raza} value={r.id_raza}>{r.nom_raza}</option>)}
            </select>

            <label style={lblStyle}>Fecha de nacimiento</label>
            <input type="date" value={form.fech_nac_anim} onChange={e => setForm(f => ({ ...f, fech_nac_anim: e.target.value }))} style={inputStyle} />

            <label style={lblStyle}>Estado</label>
            <select value={form.est_anim} onChange={e => setForm(f => ({ ...f, est_anim: e.target.value }))} style={inputStyle}>
              <option value="disponible">Disponible</option>
              <option value="en_proceso">En proceso</option>
              <option value="adoptado">Adoptado</option>
              <option value="inactivo">Inactivo</option>
            </select>

            <label style={lblStyle}>Descripción</label>
            <textarea value={form.desc_anim} onChange={e => setForm(f => ({ ...f, desc_anim: e.target.value }))} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Personalidad, cuidados especiales..." />

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={submitting || !form.nom_anim.trim()} style={{ flex: 2, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar mascota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lblStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };
