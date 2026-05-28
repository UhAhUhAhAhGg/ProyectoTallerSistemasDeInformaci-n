import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { refugioService } from '../services/api';
import { getNoLeidos } from '../services/mensajeriaService';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName] = useState<string | null>(() => localStorage.getItem('nombre'));
  const [userRol] = useState<string | null>(() => localStorage.getItem('rol'));
  const [estUsuario, setEstUsuario] = useState<string | null>(() => localStorage.getItem('est_usuario'));
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);

  useEffect(() => {
    const rol = localStorage.getItem('rol');

    if (rol === 'refugio') {
      refugioService.obtenerDatos()
        .then((res) => {
          const estadoRefugio = res?.data?.est_aprobacion;
          if (estadoRefugio === 'aprobado') {
            localStorage.setItem('est_usuario', 'activo');
            setEstUsuario('activo');
          }
          if (estadoRefugio === 'pendiente') {
            localStorage.setItem('est_usuario', 'pendiente');
            setEstUsuario('pendiente');
          }
          if (estadoRefugio === 'rechazado') {
            localStorage.setItem('est_usuario', 'rechazado');
            setEstUsuario('rechazado');
          }
        })
        .catch(() => {
          setEstUsuario(localStorage.getItem('est_usuario'));
        });
    }

    // Obtener conteo de mensajes no leídos
    if (rol === 'adoptante' || rol === 'refugio') {
      getNoLeidos().then(setMensajesNoLeidos).catch(() => {});
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDashboard = () => {
    if (userRol === 'administrador') navigate('/admin/dashboard');
    else if (userRol === 'adoptante') navigate('/dashboard/adoptante');
    else if (userRol === 'refugio') navigate('/dashboard/refugio');
  };

  const isPendiente = userRol === 'refugio' && estUsuario === 'pendiente';
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate('/')}>
        <span className="navbar-paw">🐾</span>
        <span className="navbar-title">PetMatch</span>
      </button>

      <div className="navbar-links">
        <button className={`navbar-link ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}>
          Inicio
        </button>
        <button className={`navbar-link ${isActive('/catalogo') ? 'active' : ''}`} onClick={() => navigate('/catalogo')}>
          Catalogo
        </button>

        {userRol === 'adoptante' && (
          <button className={`navbar-link ${isActive('/mis-solicitudes') ? 'active' : ''}`} onClick={() => navigate('/mis-solicitudes')}>
            Mis solicitudes
          </button>
        )}

        {userRol === 'refugio' && estUsuario === 'activo' && (
          <>
            <button className={`navbar-link ${isActive('/refugio/mascotas') ? 'active' : ''}`} onClick={() => navigate('/refugio/mascotas')}>
              Mis mascotas
            </button>
            <button className={`navbar-link ${isActive('/refugio/adopciones') ? 'active' : ''}`} onClick={() => navigate('/refugio/adopciones')}>
              Solicitudes
            </button>
          </>
        )}

        {userName && (
          <>
            <button className={`navbar-link ${isActive('/notificaciones') ? 'active' : ''}`} onClick={() => navigate('/notificaciones')}>
              Notificaciones
            </button>
            <button
              className={`navbar-link ${isActive('/mensajeria') ? 'active' : ''}`}
              onClick={() => navigate('/mensajeria')}
              style={{ position: 'relative' }}
            >
              Mensajes
              {mensajesNoLeidos > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  background: '#e53e3e',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.4rem',
                  minWidth: '16px',
                  textAlign: 'center',
                }}>
                  {mensajesNoLeidos}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {userName ? (
          <>
            <span className="navbar-user">
              <span className="navbar-user-dot" />
              <strong>{userName}</strong>
            </span>
            {isPendiente ? (
              <span className="navbar-badge pending">En espera</span>
            ) : (
              <button className="navbar-btn outline" onClick={handleDashboard}>Mi panel</button>
            )}
            <button className="navbar-btn ghost" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <button className="navbar-btn outline" onClick={() => navigate('/login')}>Iniciar sesion</button>
            <button className="navbar-btn filled" onClick={() => navigate('/register')}>Crear cuenta</button>
          </>
        )}
      </div>
    </nav>
  );
}
