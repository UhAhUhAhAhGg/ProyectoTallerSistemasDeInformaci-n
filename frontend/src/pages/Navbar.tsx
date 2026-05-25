import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { refugioService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName] = useState<string | null>(() => localStorage.getItem('nombre'));
  const [userRol] = useState<string | null>(() => localStorage.getItem('rol'));
  const [estUsuario, setEstUsuario] = useState<string | null>(() => localStorage.getItem('est_usuario'));

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
        <button className={`navbar-link ${isActive('/normas-politicas') ? 'active' : ''}`} onClick={() => navigate('/normas-politicas')}>
          Normas
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
