// frontend/src/pages/GestionMascotasPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PetDetailModal from '../components/catalog/PetDetailModal';
import {
  getAnimalesRefugio,
  crearAnimal,
  actualizarAnimal,
  getEspecies,
  getRazas,
  fileToBase64,
  crearPublicacion,
} from '../services/pets.service';

interface Animal {
  id_mascot:      number;
  nom_mascot:     string;
  edad_mascot:    number;
  descrip_mascot: string;
  gen_mascot:     boolean;
  esterilizado:   boolean;
  img_mascot:     string;
  nom_espe?:      string;
  nom_raza?:      string;
  id_raza?:       number;
}

interface Especie { id_espe: number; nom_espe: string; }
interface Raza    { id_raza: number; nom_raza: string; id_espe: number; }

const DEFAULT_FORM = {
  nom_mascot:     '',
  edad_mascot:    '',
  descrip_mascot: '',
  gen_mascot:     'true',
  esterilizado:   'false',
  id_espe:        '',
  id_raza:        '',
  img_mascot:     '',
};

export default function GestionMascotasPage() {
  const navigate = useNavigate();

  const [animales,   setAnimales]   = useState<Animal[]>([]);
  const [especies,   setEspecies]   = useState<Especie[]>([]);
  const [razas,      setRazas]      = useState<Raza[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [editando,   setEditando]   = useState<Animal | null>(null);
  const [form,       setForm]       = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [imgPreview, setImgPreview] = useState('');
  const [detalle,    setDetalle]    = useState<Animal | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const [a, e] = await Promise.all([getAnimalesRefugio(), getEspecies()]);
      setAnimales(a);
      setEspecies(e);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al cargar datos';
      setError(`${message}. Verifica tu sesión y que el servidor de mascotas esté activo.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (form.id_espe) {
      getRazas(Number(form.id_espe))
        .then(setRazas)
        .catch(() => setRazas([]));
    } else {
      setRazas([]);
    }
  }, [form.id_espe]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar 2 MB'); return; }
    try {
      const b64 = await fileToBase64(file);
      setImgPreview(b64);
      setForm(f => ({ ...f, img_mascot: b64 }));
    } catch {
      alert('Error al procesar la imagen');
    }
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(DEFAULT_FORM);
    setImgPreview('');
    setShowModal(true);
  };

  const abrirEditar = (a: Animal) => {
    setEditando(a);
    setForm({
      nom_mascot:     a.nom_mascot,
      edad_mascot:    String(a.edad_mascot),
      descrip_mascot: a.descrip_mascot ?? '',
      gen_mascot:     String(a.gen_mascot),
      esterilizado:   String(a.esterilizado),
      id_espe:        '',
      id_raza:        a.id_raza ? String(a.id_raza) : '',
      img_mascot:     a.img_mascot,
    });
    setImgPreview(a.img_mascot);
    setShowModal(true);
  };

  const guardar = async () => {
    if (!form.nom_mascot.trim())     { alert('El nombre es requerido');       return; }
    if (!form.edad_mascot)           { alert('La edad es requerida');         return; }
    if (!form.id_raza)               { alert('Selecciona una raza');          return; }
    if (!form.img_mascot)            { alert('La imagen es requerida');       return; }
    if (!form.descrip_mascot.trim()) { alert('La descripción es requerida');  return; }

    setSubmitting(true);
    try {
      const payload = {
        nom_mascot:     form.nom_mascot.trim(),
        edad_mascot:    Number(form.edad_mascot),
        descrip_mascot: form.descrip_mascot.trim(),
        gen_mascot:     form.gen_mascot === 'true',
        esterilizado:   form.esterilizado === 'true',
        id_raza:        Number(form.id_raza),
        img_mascot:     form.img_mascot,
      };

      if (editando) {
        await actualizarAnimal(editando.id_mascot, payload);
      } else {
        const respAnimal = await crearAnimal(payload);
        const id_mascot: number = respAnimal?.data?.id_mascot ?? respAnimal?.id_mascot;
        if (id_mascot) {
          await crearPublicacion({
            id_mascot,
            arch_publi:   form.img_mascot,
            decrip_publi: form.descrip_mascot.trim(),
          }).catch((err) => {
            console.warn('No se pudo crear la publicación automática:', err);
          });
        }
      }

      setShowModal(false);
      await cargar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      <Navbar />

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>🐾 Gestión de Mascotas</h1>
        <button
          onClick={abrirCrear}
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          + Agregar mascota
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
        {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>Cargando...</p>}
        {error   && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 16, borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        {!loading && animales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐶</div>
            <p style={{ fontSize: 16 }}>No hay mascotas registradas todavía.</p>
            <button
              onClick={abrirCrear}
              style={{ marginTop: 16, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}
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
                  {['Foto', 'Nombre', 'Especie', 'Raza', 'Edad', 'Género', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {animales.map((a, i) => (
                  <tr key={a.id_mascot} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <img
                        src={a.img_mascot}
                        alt={a.nom_mascot}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=🐾'; }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{a.nom_mascot}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.nom_espe ?? '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.nom_raza ?? '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.edad_mascot} año{a.edad_mascot !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{a.gen_mascot ? 'Macho' : 'Hembra'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setDetalle(a)}
                          style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => abrirEditar(a)}
                          style={{ background: '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {detalle && (
        <PetDetailModal
          pet={{
            id_mascot:      detalle.id_mascot,
            nom_mascot:     detalle.nom_mascot,
            nom_espe:       detalle.nom_espe ?? '',
            nom_raza:       detalle.nom_raza ?? '',
            edad_mascot:    detalle.edad_mascot,
            gen_mascot:     detalle.gen_mascot,
            esterilizado:   detalle.esterilizado,
            img_mascot:     detalle.img_mascot,
            descrip_mascot: detalle.descrip_mascot,
          }}
          onClose={() => setDetalle(null)}
        />
      )}

      {/* Modal editar/crear */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              {editando ? 'Editar mascota' : 'Nueva mascota'}
            </h2>

            <label style={lblStyle}>Foto de la mascota *</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', marginBottom: 4, background: imgPreview ? '#f8fafc' : '#fafafa' }}
            >
              {imgPreview ? (
                <img src={imgPreview} alt="preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  Haz clic para subir una imagen (máx. 2 MB)
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            {imgPreview && (
              <button
                onClick={() => { setImgPreview(''); setForm(f => ({ ...f, img_mascot: '' })); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                ✕ Quitar imagen
              </button>
            )}

            <label style={lblStyle}>Nombre *</label>
            <input value={form.nom_mascot} onChange={e => setForm(f => ({ ...f, nom_mascot: e.target.value }))} style={inputStyle} placeholder="Ej: Luna" />

            <label style={lblStyle}>Especie *</label>
            <select value={form.id_espe} onChange={e => setForm(f => ({ ...f, id_espe: e.target.value, id_raza: '' }))} style={inputStyle}>
              <option value="">Seleccionar especie</option>
              {especies.map(e => <option key={e.id_espe} value={e.id_espe}>{e.nom_espe}</option>)}
            </select>

            <label style={lblStyle}>Raza *</label>
            <select value={form.id_raza} onChange={e => setForm(f => ({ ...f, id_raza: e.target.value }))} style={{ ...inputStyle, opacity: !form.id_espe ? 0.6 : 1 }} disabled={!form.id_espe}>
              <option value="">{form.id_espe ? 'Seleccionar raza' : 'Primero elige una especie'}</option>
              {razas.map(r => <option key={r.id_raza} value={r.id_raza}>{r.nom_raza}</option>)}
            </select>

            <label style={lblStyle}>Edad (años) *</label>
            <input type="number" min={0} max={30} value={form.edad_mascot} onChange={e => setForm(f => ({ ...f, edad_mascot: e.target.value }))} style={inputStyle} placeholder="Ej: 2" />

            <label style={lblStyle}>Género</label>
            <select value={form.gen_mascot} onChange={e => setForm(f => ({ ...f, gen_mascot: e.target.value }))} style={inputStyle}>
              <option value="true">Macho</option>
              <option value="false">Hembra</option>
            </select>

            <label style={lblStyle}>¿Está esterilizado/a?</label>
            <select value={form.esterilizado} onChange={e => setForm(f => ({ ...f, esterilizado: e.target.value }))} style={inputStyle}>
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>

            <label style={lblStyle}>Descripción *</label>
            <textarea value={form.descrip_mascot} onChange={e => setForm(f => ({ ...f, descrip_mascot: e.target.value }))} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Personalidad, cuidados especiales, historia..." />

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={submitting} style={{ flex: 2, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: 12, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
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