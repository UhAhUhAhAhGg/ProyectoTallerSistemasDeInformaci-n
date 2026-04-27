// filepath: src/pages/AdoptanteDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AdoptanteDashboard.css';

const ADMIN_EMAIL = 'admin@petmatch.com';

export default function AdoptanteDashboard() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState<string | null>(null);
  const [estUsuario, setEstUsuario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    // Si no hay token o no es adoptante, redirige
    if (!token || rol !== 'adoptante') {
      navigate('/login');
      return;
    }

    // Leer datos del JWT para saber si es refugio rechazado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEstUsuario(payload.est || localStorage.getItem('est_usuario'));
    } catch {
      setEstUsuario(localStorage.getItem('est_usuario'));
    }

    setNombre(localStorage.getItem('nombre'));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="ad-wrapper">
        <Navbar />
        <div className="ad-main"><div className="loading">Cargando...</div></div>
      </div>
    );
  }

  // Refugio rechazado que fue degradado a rol adoptante
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

            <div className="ad-btn-group">
              <button className="ad-btn secondary" onClick={() => navigate('/')}>
                🏠 Volver al inicio
              </button>
              <button className="ad-btn ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adoptante normal con perfil completo
  return (
    <div className="ad-wrapper">
      <Navbar />
      <div className="ad-main">
        <div className="ad-welcome">
          <div>
            <h1>¡Hola, {nombre || 'Adoptante'}! 🐾</h1>
            <p>Encuentra tu compañero ideal y gestiona tus solicitudes desde aquí.</p>
          </div>
          <div className="ad-welcome-actions">
            <button className="ad-btn secondary sm" onClick={() => navigate('/')}>🏠 Inicio</button>
            <button className="ad-btn ghost sm" onClick={handleLogout}>Salir</button>
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
          <div className="ad-option" onClick={() => navigate('/notificaciones')}>
            <div className="ad-option-icon">🔔</div>
            <div className="ad-option-info">
              <h3>Notificaciones</h3>
              <p>Ver mensajes y alertas recientes</p>
            </div>
            <span className="ad-option-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}