import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [estUsuario, setEstUsuario] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('nombre'));
    setUserRol(localStorage.getItem('rol'));
    setEstUsuario(localStorage.getItem('est_usuario'));
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
          <button className={`navbar-link ${isActive('/notificaciones') ? 'active' : ''}`} onClick={() => navigate('/notificaciones')}>
            Notificaciones
          </button>
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
