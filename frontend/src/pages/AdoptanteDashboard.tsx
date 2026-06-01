// filepath: frontend/src/pages/AdoptanteDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdoptanteDashboard.css';
import Navbar from './Navbar';

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

  // Refugio rechazado degradado a adoptante
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

  // Adoptante normal
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

        {/* 🧪 DEBUG BOX */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffe0e6', borderRadius: '5px', border: '2px solid #d4437d' }}>
          <p style={{ fontSize: '14px', margin: '5px 0', fontWeight: 'bold', color: '#d4437d' }}>
            🔍 DEBUG - Valores en localStorage:
          </p>
          <p style={{ fontSize: '12px', margin: '3px 0', color: '#333' }}>
            • rol = "{userRol}" {userRol === 'adoptante' ? '✅' : '❌'}
          </p>
          <p style={{ fontSize: '12px', margin: '3px 0', color: '#333' }}>
            • est_usuario = "{estUsuario}" {estUsuario === 'activo' || estUsuario === 'incompleto' ? '✅' : '❌'}
          </p>
          <p style={{ fontSize: '12px', margin: '3px 0', color: '#333' }}>
            • nombre = "{nombre}" {nombre ? '✅' : '❌'}
          </p>
          <p style={{ fontSize: '12px', margin: '10px 0 0 0', fontWeight: 'bold', color: '#d4437d' }}>
            Condición para botón: (rol=adoptante) OR (rol=refugio AND estado=activo)
          </p>
          {(userRol === 'adoptante' || (userRol === 'refugio' && estUsuario === 'activo')) ? (
            <button
              onClick={() => navigate('/adaptacion-seguimiento')}
              style={{
                marginTop: '10px',
                backgroundColor: '#d4437d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✅ BOTÓN VISIBLE - Ir a {userRol === 'refugio' ? 'Observaciones' : 'Seguimiento'}
            </button>
          ) : (
            <p style={{ fontSize: '12px', margin: '10px 0 0 0', color: '#999', fontWeight: 'bold' }}>
              ❌ BOTÓN NO VISIBLE - Condición no se cumple
            </p>
          )}
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
              <p>Recibe recomendaciones segun tu perfil</p>
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
        </div>
      </div>
    </div>
  );
}
