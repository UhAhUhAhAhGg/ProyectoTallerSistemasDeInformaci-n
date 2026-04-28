// filepath: src/pages/GestionMascotasPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAnimalesRefugio,
  crearAnimal,
  actualizarAnimal,
  getEspecies,
  getRazas,
} from '../services/pets.service';

// La API real devuelve campos de MASCOTAS + JOIN con RAZAS y ESPECIES
interface Animal {
  id_mascot: number;
  nom_mascot: string;
  edad_mascot?: number;
  fenac_mascot?: string;
  descrip_mascot?: string;
  gen_mascot?: boolean;
  esterilizado?: boolean;
  img_mascot?: string;
  nom_espe?: string;
  nom_raza?: string;
  id_raza?: number;
  // De publicaciones
  est_publi?: boolean;
  est_adop?: boolean;
}

interface Especie {
  id_espe: number;
  nom_espe: string;
}

interface Raza {
  id_raza: number;
  id_espe: number;
  nom_raza: string;
}

export default function GestionMascotasPage() {
  const navigate = useNavigate();
  const [animales, setAnimales]     = useState<Animal[]>([]);
  const [especies, setEspecies]     = useState<Especie[]>([]);
  const [razas, setRazas]           = useState<Raza[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editando, setEditando]     = useState<Animal | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nom_mascot: '',
    edad_mascot: '',
    fenac_mascot: '',
    descrip_mascot: '',
    gen_mascot: 'true',
    esterilizado: 'false',
    img_mascot: '',
    id_raza: '',
    id_espe: '',
    // Para la publicación
    decrip_publi: '',
  });

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const [animalesData, especiesData] = await Promise.all([
        getAnimalesRefugio(),
        getEspecies(),
      ]);
      setAnimales(animalesData);
      setEspecies(especiesData);
    } catch {
      setError('Error al cargar datos. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Cargar razas cuando cambia la especie seleccionada
  useEffect(() => {
    if (form.id_espe) {
      getRazas(Number(form.id_espe)).then(setRazas).catch(() => setRazas([]));
    } else {
      setRazas([]);
    }
  }, [form.id_espe]);

  const resetForm = () => setForm({
    nom_mascot: '', edad_mascot: '', fenac_mascot: '',
    descrip_mascot: '', gen_mascot: 'true', esterilizado: 'false',
    img_mascot: '', id_raza: '', id_espe: '', decrip_publi: '',
  });

  const abrirCrear = () => {
    setEditando(null);
    resetForm();
    setShowModal(true);
  };

  const abrirEditar = (a: Animal) => {
    setEditando(a);
    setForm({
      nom_mascot: a.nom_mascot || '',
      edad_mascot: a.edad_mascot != null ? String(a.edad_mascot) : '',
      fenac_mascot: a.fenac_mascot?.slice(0, 10) ?? '',
      descrip_mascot: a.descrip_mascot ?? '',
      gen_mascot: a.gen_mascot != null ? String(a.gen_mascot) : 'true',
      esterilizado: a.esterilizado != null ? String(a.esterilizado) : 'false',
      img_mascot: a.img_mascot ?? '',
      id_raza: a.id_raza ? String(a.id_raza) : '',
      id_espe: '',
      decrip_publi: '',
    });
    setShowModal(true);
  };

  const guardar = async () => {
    if (!form.nom_mascot.trim() || !form.id_raza) {
      alert('Nombre y raza son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        nom_mascot: form.nom_mascot,
        edad_mascot: form.edad_mascot ? Number(form.edad_mascot) : 0,
        fenac_mascot: form.fenac_mascot || new Date().toISOString().slice(0, 10),
        descrip_mascot: form.descrip_mascot || 'Sin descripción',
        gen_mascot: form.gen_mascot === 'true',
        esterilizado: form.esterilizado === 'true',
        img_mascot: form.img_mascot || 'https://placehold.co/300x200?text=Sin+foto',
        id_raza: Number(form.id_raza),
        // Para crear también publicación
        arch_publi: form.img_mascot || 'https://placehold.co/300x200?text=Sin+foto',
        decrip_publi: form.decrip_publi || form.descrip_mascot || 'Sin descripción',
      };

      if (editando) {
        await actualizarAnimal(editando.id_mascot, payload);
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

  const getEstadoLabel = (a: Animal) => {
    if (a.est_adop) return { label: 'Adoptado', color: '#6366f1' };
    if (!a.est_publi) return { label: 'Inactivo', color: '#94a3b8' };
    return { label: 'Disponible', color: '#22c55e' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/dashboard/refugio')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}
          >
            ← Volver
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            🐾 Gestión de Mascotas
          </h1>
        </div>
        <button
          onClick={abrirCrear}
          style={{
            background: '#6366f1', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
        >
          + Agregar mascota
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
        {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>Cargando...</p>}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!loading && animales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐶</div>
            <p style={{ fontSize: 16 }}>No hay mascotas registradas todavía.</p>
            <button
              onClick={abrirCrear}
              style={{
                marginTop: 16, background: '#6366f1', color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 24px',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              Registrar primera mascota
            </button>
          </div>
        )}

        {animales.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nombre', 'Especie', 'Raza', 'Edad', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 12,
                      fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {animales.map((a, i) => {
                  const estado = getEstadoLabel(a);
                  return (
                    <tr key={a.id_mascot} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>
                        {a.nom_mascot}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{a.nom_espe ?? '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{a.nom_raza ?? '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {a.edad_mascot != null ? `${a.edad_mascot} años` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: estado.color + '20', color: estado.color,
                          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        }}>
                          {estado.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => abrirEditar(a)}
                          style={{
                            background: '#e0e7ff', color: '#6366f1', border: 'none',
                            borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
                            fontWeight: 600, fontSize: 13, marginRight: 8,
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              {editando ? 'Editar mascota' : 'Nueva mascota'}
            </h2>

            <label style={lblStyle}>Nombre *</label>
            <input
              value={form.nom_mascot}
              onChange={e => setForm(f => ({ ...f, nom_mascot: e.target.value }))}
              style={inputStyle}
              placeholder="Ej: Luna"
            />

            <label style={lblStyle}>Especie</label>
            <select
              value={form.id_espe}
              onChange={e => setForm(f => ({ ...f, id_espe: e.target.value, id_raza: '' }))}
              style={inputStyle}
            >
              <option value="">Seleccionar especie</option>
              {especies.map(e => (
                <option key={e.id_espe} value={e.id_espe}>{e.nom_espe}</option>
              ))}
            </select>

            <label style={lblStyle}>Raza *</label>
            <select
              value={form.id_raza}
              onChange={e => setForm(f => ({ ...f, id_raza: e.target.value }))}
              style={inputStyle}
              disabled={!form.id_espe}
            >
              <option value="">Seleccionar raza</option>
              {razas.map(r => (
                <option key={r.id_raza} value={r.id_raza}>{r.nom_raza}</option>
              ))}
            </select>

            <label style={lblStyle}>Edad (años)</label>
            <input
              type="number"
              min={0}
              value={form.edad_mascot}
              onChange={e => setForm(f => ({ ...f, edad_mascot: e.target.value }))}
              style={inputStyle}
              placeholder="Ej: 3"
            />

            <label style={lblStyle}>Fecha de nacimiento</label>
            <input
              type="date"
              value={form.fenac_mascot}
              onChange={e => setForm(f => ({ ...f, fenac_mascot: e.target.value }))}
              style={inputStyle}
            />

            <label style={lblStyle}>Sexo</label>
            <select
              value={form.gen_mascot}
              onChange={e => setForm(f => ({ ...f, gen_mascot: e.target.value }))}
              style={inputStyle}
            >
              <option value="true">Macho</option>
              <option value="false">Hembra</option>
            </select>

            <label style={lblStyle}>Esterilizado</label>
            <select
              value={form.esterilizado}
              onChange={e => setForm(f => ({ ...f, esterilizado: e.target.value }))}
              style={inputStyle}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>

            <label style={lblStyle}>URL de foto</label>
            <input
              value={form.img_mascot}
              onChange={e => setForm(f => ({ ...f, img_mascot: e.target.value }))}
              style={inputStyle}
              placeholder="https://..."
            />

            <label style={lblStyle}>Descripción</label>
            <textarea
              value={form.descrip_mascot}
              onChange={e => setForm(f => ({ ...f, descrip_mascot: e.target.value }))}
              style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              placeholder="Personalidad, cuidados especiales..."
            />

            {!editando && (
              <>
                <label style={lblStyle}>Descripción para el catálogo</label>
                <textarea
                  value={form.decrip_publi}
                  onChange={e => setForm(f => ({ ...f, decrip_publi: e.target.value }))}
                  style={{ ...inputStyle, height: 60, resize: 'vertical' }}
                  placeholder="Texto que verán los adoptantes..."
                />
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, background: '#f1f5f9', color: '#475569',
                  border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={submitting || !form.nom_mascot.trim() || !form.id_raza}
                style={{
                  flex: 2, background: '#6366f1', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '12px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600, opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar mascota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6, marginTop: 14,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: 14, outline: 'none',
  boxSizing: 'border-box', background: '#fff',
};