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
  const [submitted, setSubmitted] = useState(false);
  const [estadoRefugio, setEstadoRefugio] = useState<string | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(true);
  const [datosGuardados, setDatosGuardados] = useState<any>(null);

  useEffect(() => {
    verificarEstadoRefugio();
  }, []);

  const verificarEstadoRefugio = async () => {
    try {
      const response = await api.get('/refugios/datos');
      if (response.data.success && response.data.data) {
        setEstadoRefugio(response.data.data.est_aprobacion);
        setDatosGuardados(response.data.data);
      }
    } catch {
      console.log('Refugio sin perfil completado');
    } finally {
      setLoadingEstado(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
    try {
      const response = await api.post('/refugios/datos', {
        nom_refug: formData.nom_refug,
        dir_refug: formData.dir_refug,
        telf_refug: formData.telf_refug,
        licencia_refug: formData.licencia_refug,
        descripcion: formData.descripcion,
      });
      if (response.data.success) {
        setSubmitted(true);
        localStorage.setItem('est_usuario', 'pendiente');
      }
    } catch (error: any) {
      setErrors({ general: error.response?.data?.mensaje || 'Error al guardar datos' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingEstado) {
    return (
      <div className="rp-wrapper">
        <Navbar />
        <div className="rp-container"><div className="rp-card"><div className="loading">Verificando estado...</div></div></div>
      </div>
    );
  }

  if (estadoRefugio === 'aprobado') {
    return (
      <div className="rp-wrapper">
        <Navbar />
        <div className="rp-container">
          <div className="rp-card">
            <div className="rp-status-msg success">
              <div className="rp-status-icon success">✓</div>
              <h2>¡Tu Solicitud fue Aprobada!</h2>
              <p>Ya puedes acceder a todas las funcionalidades como refugio.</p>
              <div className="rp-btn-group">
                <button className="rp-btn primary" onClick={() => navigate('/dashboard/refugio')}>
                  Ir al Dashboard →
                </button>
                <button className="rp-btn secondary" onClick={() => navigate('/')}>
                  🏠 Ir al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="rp-info-text">Revisa tus datos o comunícate con el administrador para más información.</p>
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

  if (submitted || (estadoRefugio === 'pendiente' && datosGuardados)) {
    return (
      <div className="rp-wrapper">
        <Navbar />
        <div className="rp-container">
          <div className="rp-card">
            <div className="rp-status-msg pending">
              <div className="rp-status-icon pending">⏳</div>
              <h2>¡Datos Enviados!</h2>
              <p>Tu refugio está <strong>pendiente de validación</strong> por un administrador.</p>
              <p className="rp-info-text">Recibirás una notificación cuando tu perfil sea aprobado.</p>
              
              {datosGuardados && (
                <div className="rp-datos-card">
                  <h3>Datos enviados:</h3>
                  <div className="rp-dato-row"><span>Nombre</span><strong>{datosGuardados.nom_refug}</strong></div>
                  <div className="rp-dato-row"><span>Dirección</span><strong>{datosGuardados.dir_refug}</strong></div>
                  <div className="rp-dato-row"><span>Teléfono</span><strong>{datosGuardados.telf_refug}</strong></div>
                  <div className="rp-dato-row"><span>Licencia</span><strong>{datosGuardados.licencia_refug}</strong></div>
                </div>
              )}

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

  return (
    <div className="rp-wrapper">
      <Navbar />
      <div className="rp-container">
        <div className="rp-card">
          {/* Breadcrumb */}
          <div className="rp-breadcrumb">
            <button onClick={() => navigate('/')}>Inicio</button>
            <span>›</span>
            <span>Perfil de Refugio</span>
          </div>

          <div className="rp-header">
            <div className="rp-header-icon">🏠</div>
            <div>
              <h1>Completa tu Perfil de Refugio</h1>
              <p>Ingresa los datos de tu organización para ser aprobado</p>
            </div>
          </div>

          {errors.general && <div className="error-banner">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nom_refug">Nombre del Refugio *</label>
              <input type="text" id="nom_refug" name="nom_refug" value={formData.nom_refug} onChange={handleChange} placeholder="Nombre de tu organización" className={errors.nom_refug ? 'error' : ''} />
              {errors.nom_refug && <span className="error-text">{errors.nom_refug}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dir_refug">Dirección *</label>
              <input type="text" id="dir_refug" name="dir_refug" value={formData.dir_refug} onChange={handleChange} placeholder="Dirección completa" className={errors.dir_refug ? 'error' : ''} />
              {errors.dir_refug && <span className="error-text">{errors.dir_refug}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telf_refug">Teléfono *</label>
                <input type="text" id="telf_refug" name="telf_refug" value={formData.telf_refug} onChange={handleChange} placeholder="Número de contacto" className={errors.telf_refug ? 'error' : ''} />
                {errors.telf_refug && <span className="error-text">{errors.telf_refug}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="licencia_refug">Número de Licencia *</label>
                <input type="text" id="licencia_refug" name="licencia_refug" value={formData.licencia_refug} onChange={handleChange} placeholder="Licencia o registro oficial" className={errors.licencia_refug ? 'error' : ''} />
                {errors.licencia_refug && <span className="error-text">{errors.licencia_refug}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción (opcional)</label>
              <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Cuéntanos sobre tu refugio..." rows={4} />
            </div>

            <div className="rp-form-actions">
              <button type="button" className="rp-btn secondary" onClick={() => navigate('/')}>
                ← Cancelar
              </button>
              <button type="submit" className="rp-btn primary" disabled={loading}>
                {loading ? 'Enviando...' : '📤 Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}