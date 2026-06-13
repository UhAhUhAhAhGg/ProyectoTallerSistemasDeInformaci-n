// filepath: frontend/src/pages/AdoptanteDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdoptanteDashboard.css';
import Navbar from './Navbar';
import HistorialSolicitudesMF from './gestion-solicitudes/HistorialSolicitudesMF';

const ADMIN_EMAIL = 'admin@petmatch.com';

export default function AdoptanteDashboard() {
  const navigate = useNavigate();
  const [nombre, setNombre]         = useState<string | null>(null);
  const [userRol, setUserRol]       = useState<string | null>(null);
  const [estUsuario, setEstUsuario] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol   = localStorage.getItem('rol');

    if (!token || rol !== 'adoptante') {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEstUsuario(payload.est || localStorage.getItem('est_usuario'));
    } catch {
      setEstUsuario(localStorage.getItem('est_usuario'));
    }

    setNombre(localStorage.getItem('nombre'));
    setUserRol(rol);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="ad-wrapper">
        <Navbar />
        <div className="ad-main"><div className="loading">Cargando...</div></div>
      </div>
    );
  }

  if (estUsuario === 'rechazado') {
    return (
      <div className="ad-wrapper">
        <Navbar />
        <div className="ad-main">
          <div className="ad-rejected-card">
            <div className="ad-rejected-icon">✗</div>
            <h2>Solicitud Rechazada</h2>
            <p>
              Tu solicitud de registro como refugio fue <strong>rechazada</strong> por el administrador de la plataforma.
            </p>
            <p className="ad-rejected-info">
              Si crees que esto es un error o deseas más información, comunícate directamente con el administrador.
            </p>
            <div className="ad-contact-box">
              <span className="ad-contact-box-icon">✉️</span>
              <div className="ad-contact-box-info">
                <span className="ad-contact-box-label">Correo del administrador</span>
                <a href={`mailto:${ADMIN_EMAIL}`} className="ad-contact-box-email">
                  {ADMIN_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const puedeVerSeguimiento =
    userRol === 'adoptante' ||
    (userRol === 'refugio' && estUsuario === 'activo');

  return (
    <div className="ad-wrapper">
      <Navbar />
      <div className="ad-main">
        <div className="ad-welcome">
          <div>
            <h1>¡Hola, {nombre || 'Adoptante'}! 🐾</h1>
            <p>Encuentra tu compañero ideal y gestiona tus solicitudes desde aquí.</p>
          </div>
        </div>

        <div className="ad-grid">
          <div className="ad-option" onClick={() => navigate('/catalogo')}>
            <div className="ad-option-icon">🔍</div>
            <div className="ad-option-info">
              <h3>Explorar Mascotas</h3>
              <p>Encuentra mascotas disponibles para adopción</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>

          <div className="ad-option" onClick={() => navigate('/mis-solicitudes')}>
            <div className="ad-option-icon">📋</div>
            <div className="ad-option-info">
              <h3>Mis Solicitudes</h3>
              <p>Revisa el estado de tus solicitudes de adopción</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>

          <div className="ad-option" onClick={() => navigate('/completar-perfil/adoptante')}>
            <div className="ad-option-icon">👤</div>
            <div className="ad-option-info">
              <h3>Mi Perfil</h3>
              <p>Actualiza tus preferencias de adopción</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>

          <div className="ad-option ad-option--matching" onClick={() => navigate('/matching')}>
            <div className="ad-option-icon">IA</div>
            <div className="ad-option-info">
              <h3>Matching IA</h3>
              <p>Recibe recomendaciones según tu perfil</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>

          <div className="ad-option" onClick={() => navigate('/notificaciones')}>
            <div className="ad-option-icon">🔔</div>
            <div className="ad-option-info">
              <h3>Notificaciones</h3>
              <p>Ver mensajes y alertas recientes</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>

          <div className="ad-option" onClick={() => navigate('/mensajeria')}>
            <div className="ad-option-icon">💬</div>
            <div className="ad-option-info">
              <h3>Mensajes</h3>
              <p>Conversa con los refugios sobre sus mascotas</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>

          {puedeVerSeguimiento && (
            <div className="ad-option" onClick={() => navigate('/adaptacion-seguimiento')}>
              <div className="ad-option-icon">📊</div>
              <div className="ad-option-info">
                <h3>Seguimiento</h3>
                <p>Revisa el proceso de adaptación de tu mascota</p>
              </div>
              <span className="ad-option-arrow">→</span>
            </div>
          )}
        </div>

        {/* Widget: resumen rápido de solicitudes */}
        <div style={{
          marginTop: 32,
          background: '#fff',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Últimas solicitudes
            </h2>
            <button
              onClick={() => navigate('/mis-solicitudes')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6366f1', fontSize: 13, fontWeight: 600,
              }}
            >
              Ver todas →
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 0 }}>
            Resumen rápido de tus solicitudes de adopción.
          </p>
          <HistorialSolicitudesMF />
        </div>
      </div>
    </div>
  );
}