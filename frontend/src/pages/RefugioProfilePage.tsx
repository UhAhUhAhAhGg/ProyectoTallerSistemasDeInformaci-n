// filepath: src/pages/RefugioProfilePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../pages/Navbar';
import './RefugioProfilePage.css';

export default function RefugioProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom_refug: '',
    dir_refug: '',
    telf_refug: '',
    licencia_refug: '',
    descripcion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [estadoRefugio, setEstadoRefugio] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await api.get('/refugios/datos');
      if (response.data.success && response.data.data) {
        const datos = response.data.data;
        setEstadoRefugio(datos.est_aprobacion);
        // Siempre pre-llenar el formulario con los datos existentes
        setFormData({
          nom_refug: datos.nom_refug || '',
          dir_refug: datos.dir_refug || '',
          telf_refug: datos.telf_refug || '',
          licencia_refug: datos.licencia_refug || '',
          descripcion: datos.descripcion || '',
        });
      }
    } catch {
      // Sin datos previos, el form queda vacío
    } finally {
      setLoadingDatos(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setGuardadoOk(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom_refug.trim()) newErrors.nom_refug = 'El nombre del refugio es requerido';
    if (!formData.dir_refug.trim()) newErrors.dir_refug = 'La dirección es requerida';
    if (!formData.telf_refug.trim()) newErrors.telf_refug = 'El teléfono es requerido';
    if (!formData.licencia_refug.trim()) newErrors.licencia_refug = 'El número de licencia es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  setLoading(true);
  setGuardadoOk(false);
  try {
    const payload = {
      nom_refug: formData.nom_refug,
      dir_refug: formData.dir_refug,
      telf_refug: formData.telf_refug,
      licencia_refug: formData.licencia_refug,
      descripcion: formData.descripcion,
    };

    const response = estadoRefugio === 'aprobado'
      ? await api.patch('/refugios/datos', payload)
      : await api.post('/refugios/datos', payload);

    if (response.data.success) {
      setGuardadoOk(true);
      if (estadoRefugio !== 'aprobado') {
        localStorage.setItem('est_usuario', 'pendiente');
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        setEstadoRefugio('pendiente');
      }
    }
  } catch (error: any) {
    setErrors({ general: error.response?.data?.mensaje || 'Error al guardar datos' });
  } finally {
    setLoading(false);
  }
};

  // ── Cargando ─────────────────────────────────────────────────────────────────
  if (loadingDatos) {
    return (
      <div className="rp-wrapper">
        <Navbar />
        <div className="rp-container">
          <div className="rp-card">
            <div className="loading">Cargando datos...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Aprobado ─────────────────────────────────────────────────────────────────
  if (estadoRefugio === 'aprobado') {
    return (
      <div className="rp-wrapper">
        <Navbar />
        <div className="rp-container">
          <div className="rp-card">
            <div className="rp-status-msg success">
              <div className="rp-status-icon success">✓</div>
              <h2>¡Tu Refugio está Aprobado!</h2>
              <p>Ya puedes acceder a todas las funcionalidades como refugio.</p>
              <div className="rp-btn-group">
                <button className="rp-btn primary" onClick={() => navigate('/dashboard/refugio')}>
                  Ir al Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Rechazado ────────────────────────────────────────────────────────────────
  if (estadoRefugio === 'rechazado') {
    return (
      <div className="rp-wrapper">
        <Navbar />
        <div className="rp-container">
          <div className="rp-card">
            <div className="rp-status-msg error">
              <div className="rp-status-icon error">✗</div>
              <h2>Tu Solicitud fue Rechazada</h2>
              <p>Tu solicitud de registro fue rechazada.</p>
              <p className="rp-info-text">
                Comunícate con el administrador para más información.
              </p>
              <div className="rp-btn-group">
                <button className="rp-btn secondary" onClick={() => navigate('/')}>
                  🏠 Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario (pendiente o sin datos aún) ────────────────────────────────────
  return (
    <div className="rp-wrapper">
      <Navbar />
      <div className="rp-container">
        <div className="rp-card">
          <div className="rp-breadcrumb">
            <button onClick={() => navigate('/dashboard/refugio')}>Dashboard</button>
            <span>›</span>
            <span>Mi Perfil</span>
          </div>

          <div className="rp-header">
            <div className="rp-header-icon">🏠</div>
            <div>
              <h1>Datos del Refugio</h1>
              <p>
                {estadoRefugio === 'pendiente'
  ? '⏳ Tu solicitud está pendiente de aprobación'
  : estadoRefugio === 'aprobado'
  ? '✓ Refugio aprobado — podés actualizar tus datos'
  : 'Completa los datos de tu organización'}
              </p>
            </div>
          </div>

          {guardadoOk && (
            <div style={{
              background: '#d1fae5', border: '1px solid #6ee7b7',
              color: '#065f46', padding: '12px 16px', borderRadius: 10,
              marginBottom: 20, fontSize: 14,
            }}>
              ✓ Datos guardados correctamente. Tu solicitud está pendiente de validación.
            </div>
          )}

          {errors.general && <div className="error-banner">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nom_refug">Nombre del Refugio *</label>
              <input
                type="text"
                id="nom_refug"
                name="nom_refug"
                value={formData.nom_refug}
                onChange={handleChange}
                placeholder="Nombre de tu organización"
                className={errors.nom_refug ? 'error' : ''}
              />
              {errors.nom_refug && <span className="error-text">{errors.nom_refug}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dir_refug">Dirección *</label>
              <input
                type="text"
                id="dir_refug"
                name="dir_refug"
                value={formData.dir_refug}
                onChange={handleChange}
                placeholder="Dirección completa"
                className={errors.dir_refug ? 'error' : ''}
              />
              {errors.dir_refug && <span className="error-text">{errors.dir_refug}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telf_refug">Teléfono *</label>
                <input
                  type="text"
                  id="telf_refug"
                  name="telf_refug"
                  value={formData.telf_refug}
                  onChange={handleChange}
                  placeholder="Número de contacto"
                  className={errors.telf_refug ? 'error' : ''}
                />
                {errors.telf_refug && <span className="error-text">{errors.telf_refug}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="licencia_refug">Número de Licencia *</label>
                <input
                  type="text"
                  id="licencia_refug"
                  name="licencia_refug"
                  value={formData.licencia_refug}
                  onChange={handleChange}
                  placeholder="Licencia o registro oficial"
                  className={errors.licencia_refug ? 'error' : ''}
                />
                {errors.licencia_refug && (
                  <span className="error-text">{errors.licencia_refug}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción (opcional)</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Cuéntanos sobre tu refugio..."
                rows={4}
              />
            </div>

            <div className="rp-form-actions">
              <button
                type="button"
                className="rp-btn secondary"
                onClick={() => navigate('/dashboard/refugio')}
              >
                ← Volver
              </button>
              <button type="submit" className="rp-btn primary" disabled={loading}>
                {loading ? 'Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}