import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { refugioService } from '../services/api';
import { getNoLeidos } from '../services/mensajeriaService';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('nombre'));
  const [userRol, setUserRol] = useState<string | null>(() => localStorage.getItem('rol'));
  const [estUsuario, setEstUsuario] = useState<string | null>(() => localStorage.getItem('est_usuario'));
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);

  const updateAuthState = () => {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const estado = localStorage.getItem('est_usuario');

    setUserName(nombre);
    setUserRol(rol);
    setEstUsuario(estado);

    if (rol === 'refugio') {
      refugioService.obtenerDatos()
        .then((res) => {
          const estadoRefugio = res?.data?.est_aprobacion;
          if (estadoRefugio === 'aprobado') {
            localStorage.setItem('est_usuario', 'activo');
            setEstUsuario('activo');
          } else if (estadoRefugio === 'pendiente') {
            localStorage.setItem('est_usuario', 'pendiente');
            setEstUsuario('pendiente');
          } else if (estadoRefugio === 'rechazado') {
            localStorage.setItem('est_usuario', 'rechazado');
            setEstUsuario('rechazado');
          }
        })
        .catch(() => {
          setEstUsuario(localStorage.getItem('est_usuario'));
        });
    }
  };

  // Actualizar al montar
  useEffect(() => {
    updateAuthState();
  }, []);

  // Actualizar cuando cambia la ruta
  useEffect(() => {
    updateAuthState();
  }, [location.pathname]);

  // Polling: verificar localStorage cada 500ms para cambios inmediatos (login, logout)
  useEffect(() => {
    const interval = setInterval(() => {
      const nombre = localStorage.getItem('nombre');
      const rol = localStorage.getItem('rol');
      const estado = localStorage.getItem('est_usuario');

      setUserName(nombre);
      setUserRol(rol);
      setEstUsuario(estado);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Polling de mensajes no leídos cada 30 segundos
  useEffect(() => {
    if (!userName) {
      setMensajesNoLeidos(0);
      return;
    }
    const fetchNoLeidos = () => {
      getNoLeidos()
        .then(setMensajesNoLeidos)
        .catch(() => {});
    };
    fetchNoLeidos();
    const interval = setInterval(fetchNoLeidos, 30_000);
    return () => clearInterval(interval);
  }, [userName, location.pathname]);

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
        <button className={`navbar-link ${isActive('/normas-politicas') ? 'active' : ''}`} onClick={() => navigate('/normas-politicas')}>
          Normas
        </button>

        {(userRol === 'adoptante' || (userRol === 'refugio' && estUsuario === 'activo')) && (
          <button className={`navbar-link ${isActive('/adaptacion-seguimiento') ? 'active' : ''}`} onClick={() => navigate('/adaptacion-seguimiento')}>
            {userRol === 'refugio' ? 'Observaciones' : 'Seguimiento'}
          </button>
        )}

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