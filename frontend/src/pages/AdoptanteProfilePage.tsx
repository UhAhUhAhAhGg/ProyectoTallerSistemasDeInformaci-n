// filepath: src/pages/AdoptanteProfilePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { perfilService } from '../services/api';
import Navbar from './Navbar';
import './AdoptanteProfilePage.css';

interface Especie {
  id_espe: number;
  nom_espe: string;
}

export default function AdoptanteProfilePage() {
  const navigate = useNavigate();
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    tipo_vivienda: '',
    tiene_patio: false,
    disp_tiempo: '',
    exp_previa: false,
    desc_exp: '',
    pref_especie: '' as string | number,
    pref_tamanio: '',
    pref_edad: '',
    acepta_ninos: true,
    acepta_otros: true,
  });

  useEffect(() => {
    const cargarEspecies = async () => {
      try {
        const response = await perfilService.obtenerEspecies();
        if (response.success) setEspecies(response.data);
      } catch (error) {
        console.error('Error al cargar especies:', error);
      }
    };
    cargarEspecies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.tipo_vivienda) newErrors.tipo_vivienda = 'Selecciona el tipo de vivienda';
    if (!formData.disp_tiempo) newErrors.disp_tiempo = 'Selecciona tu disponibilidad de tiempo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await perfilService.guardarPerfil({
        tipo_vivienda: formData.tipo_vivienda,
        tiene_patio: formData.tiene_patio,
        disp_tiempo: formData.disp_tiempo,
        exp_previa: formData.exp_previa,
        desc_exp: formData.desc_exp,
        pref_especie: formData.pref_especie ? parseInt(String(formData.pref_especie)) : undefined,
        pref_tamanio: formData.pref_tamanio || undefined,
        pref_edad: formData.pref_edad || undefined,
        acepta_ninos: formData.acepta_ninos,
        acepta_otros: formData.acepta_otros,
      });
      if (response.success) navigate('/dashboard/adoptante');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.mensaje || 'Error al guardar perfil' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-wrapper">
      <Navbar />
      <div className="ap-container">
        <div className="ap-card">
          <div className="ap-breadcrumb">
            <button onClick={() => navigate('/')}>Inicio</button>
            <span>›</span>
            <span>Completar Perfil</span>
          </div>

          <div className="ap-header">
            <div className="ap-header-icon">🐾</div>
            <div>
              <h1>Completa tu Perfil</h1>
              <p>Cuéntanos sobre ti para encontrar la mascota perfecta</p>
            </div>
          </div>

          {errors.general && <div className="error-banner">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            {/* Hogar */}
            <div className="ap-section">
              <h2 className="ap-section-title">🏠 Tu hogar</h2>
              <div className="form-group">
                <label htmlFor="tipo_vivienda">Tipo de vivienda *</label>
                <select id="tipo_vivienda" name="tipo_vivienda" value={formData.tipo_vivienda} onChange={handleChange} className={errors.tipo_vivienda ? 'error' : ''}>
                  <option value="">Selecciona una opción</option>
                  <option value="casa">🏠 Casa</option>
                  <option value="apartamento">🏢 Apartamento</option>
                  <option value="finca">🌾 Finca</option>
                  <option value="otro">📍 Otro</option>
                </select>
                {errors.tipo_vivienda && <span className="error-text">{errors.tipo_vivienda}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="tiene_patio" checked={formData.tiene_patio} onChange={handleChange} />
                  <span>¿Tienes patio o espacio exterior?</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="disp_tiempo">Disponibilidad de tiempo *</label>
                <select id="disp_tiempo" name="disp_tiempo" value={formData.disp_tiempo} onChange={handleChange} className={errors.disp_tiempo ? 'error' : ''}>
                  <option value="">Selecciona una opción</option>
                  <option value="alta">🕒 Alta – Puedo dedicar mucho tiempo</option>
                  <option value="media">⏰ Media – Tiempo limitado</option>
                  <option value="baja">📅 Baja – Poco tiempo disponible</option>
                </select>
                {errors.disp_tiempo && <span className="error-text">{errors.disp_tiempo}</span>}
              </div>
            </div>

            {/* Experiencia */}
            <div className="ap-section">
              <h2 className="ap-section-title">🐕 Experiencia con animales</h2>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="exp_previa" checked={formData.exp_previa} onChange={handleChange} />
                  <span>¿Tienes experiencia previa con animales?</span>
                </label>
              </div>
              {formData.exp_previa && (
                <div className="form-group">
                  <label htmlFor="desc_exp">Describe tu experiencia</label>
                  <textarea id="desc_exp" name="desc_exp" value={formData.desc_exp} onChange={handleChange} placeholder="Cuéntanos sobre tu experiencia con mascotas..." rows={3} />
                </div>
              )}
            </div>

            {/* Preferencias */}
            <div className="ap-section">
              <h2 className="ap-section-title">❤️ Preferencias</h2>
              <div className="form-group">
                <label htmlFor="pref_especie">Especie preferida</label>
                <select id="pref_especie" name="pref_especie" value={formData.pref_especie} onChange={handleChange}>
                  <option value="">Sin preferencia</option>
                  {especies.map((e) => <option key={e.id_espe} value={e.id_espe}>{e.nom_espe}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pref_tamanio">Tamaño preferido</label>
                  <select id="pref_tamanio" name="pref_tamanio" value={formData.pref_tamanio} onChange={handleChange}>
                    <option value="">Sin preferencia</option>
                    <option value="pequeño">🐕 Pequeño</option>
                    <option value="mediano">🐕 Mediano</option>
                    <option value="grande">🐕 Grande</option>
                    <option value="cualquiera">🐾 Cualquiera</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="pref_edad">Edad preferida</label>
                  <select id="pref_edad" name="pref_edad" value={formData.pref_edad} onChange={handleChange}>
                    <option value="">Sin preferencia</option>
                    <option value="cachorro">🍼 Cachorro</option>
                    <option value="joven">🐶 Joven</option>
                    <option value="adulto">🐕 Adulto</option>
                    <option value="senior">🐢 Senior</option>
                    <option value="cualquiera">🐾 Cualquiera</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compatibilidad */}
            <div className="ap-section">
              <h2 className="ap-section-title">✨ Compatibilidad</h2>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="acepta_ninos" checked={formData.acepta_ninos} onChange={handleChange} />
                  <span>Acepto mascotas que se llevan bien con niños</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="acepta_otros" checked={formData.acepta_otros} onChange={handleChange} />
                  <span>Acepto mascotas que convivan con otros animales</span>
                </label>
              </div>
            </div>

            <div className="ap-form-actions">
              <button type="button" className="ap-btn secondary" onClick={() => navigate('/')}>← Cancelar</button>
              <button type="submit" className="ap-btn primary" disabled={loading}>
                {loading ? 'Guardando...' : '💾 Guardar Perfil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}