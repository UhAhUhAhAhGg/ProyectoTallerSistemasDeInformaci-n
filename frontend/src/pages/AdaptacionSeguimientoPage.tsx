import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observacionesService, seguimientoService, solicitudesService, type Solicitud } from '../services/observaciones.service';
import './AdaptacionSeguimientoPage.css';
import Navbar from './Navbar';

interface Observacion {
  id_obs: number;
  id_soli: number;
  id_refug: number;
  descripcion: string;
  fech_obs: string;
}

interface Seguimiento {
  id_seg: number;
  id_soli: number;
  id_usuario: number;
  descripcion: string;
  fech_seg: string;
}

export default function AdaptacionSeguimientoPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'adaptacion' | 'seguimiento'>('adaptacion');
  const [selectedSolicitud, setSelectedSolicitud] = useState<number | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName = localStorage.getItem('nombre');
  const userRol = localStorage.getItem('rol');

  // Si no hay sesión, redirigir a login
  useEffect(() => {
    if (!userName) {
      navigate('/login');
    }
  }, [userName, navigate]);

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoading(true);
        let datos: Solicitud[] = [];
        if (userRol === 'refugio') {
          datos = await solicitudesService.getSolicitudesRefugio();
        } else if (userRol === 'adoptante') {
          datos = await solicitudesService.getMisSolicitudes();
        }
        setSolicitudes(datos);
      } catch (err) {
        console.error('Error al cargar solicitudes:', err);
        setError('Error al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    };
    
    if (userRol) {
      cargarSolicitudes();
    }
  }, [userRol]);

  // Cargar observaciones cuando se selecciona una solicitud
  const cargarObservaciones = async (idSoli: number) => {
    try {
      setLoading(true);
      const data = await observacionesService.obtenerObservaciones(idSoli);
      setObservaciones(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar observaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar seguimientos cuando se selecciona una solicitud
  const cargarSeguimientos = async (idSoli: number) => {
    try {
      setLoading(true);
      const data = await seguimientoService.obtenerSeguimientos(idSoli);
      setSeguimientos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar seguimientos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSolicitud = (idSoli: number) => {
    setSelectedSolicitud(idSoli);
    if (tab === 'adaptacion' || userRol === 'refugio') {
      cargarObservaciones(idSoli);
    } else {
      cargarSeguimientos(idSoli);
    }
  };

  const handleSubmitObservacion = async () => {
    if (!selectedSolicitud || !nuevaObservacion.trim()) {
      setError('Por favor selecciona una solicitud y escribe una observación');
      return;
    }

    try {
      setLoading(true);
      await observacionesService.crearObservacion(selectedSolicitud, nuevaObservacion);
      setNuevaObservacion('');
      await cargarObservaciones(selectedSolicitud);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al registrar observación');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSeguimiento = async () => {
    if (!selectedSolicitud || !nuevoSeguimiento.trim()) {
      setError('Por favor selecciona una solicitud y escribe una novedad');
      return;
    }

    try {
      setLoading(true);
      await seguimientoService.crearSeguimiento(selectedSolicitud, nuevoSeguimiento);
      setNuevoSeguimiento('');
      await cargarSeguimientos(selectedSolicitud);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al reportar seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page">
      <Navbar />

      <div className="adaptacion-container">
        <main className="adaptacion-content">
          {/* HEADER */}
          <div className="adaptacion-header">
            <h1 className="adaptacion-title">
              {userRol === 'refugio' ? '🏥 Observaciones de Adaptación' : '📝 Seguimiento de Adopción'}
            </h1>
            <p className="adaptacion-subtitle">
              {userRol === 'refugio'
                ? 'Registra cómo se está adaptando el animal adoptado'
                : 'Reporta cómo va tu mascota adoptada'}
            </p>
          </div>

          {/* TABS - Solo para refugio */}
          {userRol === 'refugio' && (
            <div className="adaptacion-tabs">
              <button
                className={`adaptacion-tab ${tab === 'adaptacion' ? 'active' : ''}`}
                onClick={() => setTab('adaptacion')}
              >
                📋 Observaciones
              </button>
              <button
                className={`adaptacion-tab ${tab === 'seguimiento' ? 'active' : ''}`}
                onClick={() => setTab('seguimiento')}
              >
                📊 Ver Seguimientos
              </button>
            </div>
          )}

          {/* FORMULARIO */}
          <div className="adaptacion-form-section">
            <h2 className="adaptacion-section-title">
              {userRol === 'refugio' && tab === 'adaptacion'
                ? '➕ Registrar Observación'
                : userRol === 'refugio' && tab === 'seguimiento'
                ? '📊 Ver Seguimientos del Adoptante'
                : '➕ Reportar Novedad'}
            </h2>

            <div className="adaptacion-form-group">
              <label className="adaptacion-label">
                {userRol === 'refugio' && tab === 'seguimiento'
                  ? 'Selecciona solicitud'
                  : userRol === 'refugio'
                  ? 'Selecciona solicitud'
                  : 'Selecciona adopción'}
              </label>
              <select
                className="adaptacion-select"
                value={selectedSolicitud || ''}
                onChange={(e) => handleSelectSolicitud(Number(e.target.value))}
              >
                <option value="">-- Selecciona una solicitud --</option>
                {solicitudes.map((soli) => (
                  <option key={soli.id_soli} value={soli.id_soli}>
                    Solicitud #{soli.id_soli} - {soli.nom_mascot || soli.nom_refug || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>

            <div className="adaptacion-form-group">
              <label className="adaptacion-label">
                {userRol === 'refugio' && tab === 'adaptacion'
                  ? 'Observación'
                  : userRol === 'refugio' && tab === 'seguimiento'
                  ? 'Novedades del Adoptante'
                  : 'Novedad / Seguimiento'}
              </label>
              <textarea
                className="adaptacion-textarea"
                placeholder={
                  userRol === 'refugio' && tab === 'adaptacion'
                    ? 'Describe cómo se está adaptando el animal (comportamiento, salud, etc.)...'
                    : userRol === 'refugio' && tab === 'seguimiento'
                    ? 'Aquí aparecerán las novedades reportadas por el adoptante sobre la mascota...'
                    : 'Cuéntanos cómo va tu mascota (comportamiento, salud, relación familiar, etc.)...'
                }  
                value={userRol === 'refugio' ? nuevaObservacion : nuevoSeguimiento}
                onChange={(e) =>
                  userRol === 'refugio'
                    ? setNuevaObservacion(e.target.value)
                    : setNuevoSeguimiento(e.target.value)
                }
                rows={4}
              />
            </div>

            {userRol === 'refugio' && tab === 'seguimiento' ? (
              <p style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                📋 Aquí puedes ver las novedades que reporta el adoptante sobre la mascota. No puedes editar desde aquí.
              </p>
            ) : (
              <button
                className="adaptacion-btn-submit"
                onClick={userRol === 'refugio' ? handleSubmitObservacion : handleSubmitSeguimiento}
                disabled={loading}
              >
                {loading ? '⏳ Guardando...' : userRol === 'refugio' ? '✅ Registrar' : '✅ Reportar'}
              </button>
            )}

            {error && <div className="adaptacion-error">{error}</div>}
          </div>

          {/* HISTORIAL */}
          <div className="adaptacion-history-section">
            <h2 className="adaptacion-section-title">
              {userRol === 'refugio' && tab === 'adaptacion'
                ? '📚 Historial de Observaciones'
                : userRol === 'refugio' && tab === 'seguimiento'
                ? '📚 Historial de Seguimientos'
                : '📚 Mis Seguimientos'}
            </h2>

            {loading && <p className="adaptacion-loading">Cargando...</p>}

            {userRol === 'refugio' && tab === 'adaptacion' && observaciones.length === 0 && !loading && (
              <p className="adaptacion-empty">No hay observaciones registradas aún</p>
            )}

            {userRol === 'refugio' && tab === 'adaptacion' &&
              observaciones.map((obs) => (
                <div key={obs.id_obs} className="adaptacion-item">
                  <div className="adaptacion-item-header">
                    <span className="adaptacion-item-date">{formatDate(obs.fech_obs)}</span>
                    <span className="adaptacion-item-label">Solicitud #{obs.id_soli}</span>
                  </div>
                  <p className="adaptacion-item-text">{obs.descripcion}</p>
                </div>
              ))}

            {userRol === 'refugio' && tab === 'seguimiento' && seguimientos.length === 0 && !loading && (
              <p className="adaptacion-empty">No hay seguimientos registrados aún</p>
            )}

            {userRol === 'refugio' && tab === 'seguimiento' &&
              seguimientos.map((seg) => (
                <div key={seg.id_seg} className="adaptacion-item">
                  <div className="adaptacion-item-header">
                    <span className="adaptacion-item-date">{formatDate(seg.fech_seg)}</span>
                    <span className="adaptacion-item-label">Usuario #{seg.id_usuario}</span>
                  </div>
                  <p className="adaptacion-item-text">{seg.descripcion}</p>
                </div>
              ))}

            {userRol === 'adoptante' && seguimientos.length === 0 && !loading && (
              <p className="adaptacion-empty">No hay seguimientos registrados aún</p>
            )}

            {userRol === 'adoptante' &&
              seguimientos.map((seg) => (
                <div key={seg.id_seg} className="adaptacion-item">
                  <div className="adaptacion-item-header">
                    <span className="adaptacion-item-date">{formatDate(seg.fech_seg)}</span>
                    <span className="adaptacion-item-label">Solicitud #{seg.id_soli}</span>
                  </div>
                  <p className="adaptacion-item-text">{seg.descripcion}</p>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
