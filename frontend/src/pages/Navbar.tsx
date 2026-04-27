// filepath: src/components/Navbar.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [estUsuario, setEstUsuario] = useState<string | null>(null);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const est = localStorage.getItem('est_usuario');
    setUserName(nombre);
    setUserRol(rol);
    setEstUsuario(est);
  }, []);

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

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate('/')}>
        <span className="navbar-paw">🐾</span>
        <span className="navbar-title">PetMatch</span>
      </button>
      <div className="navbar-actions">
        {userName ? (
          <>
            <span className="navbar-user">
              <span className="navbar-user-dot" />
              <strong>{userName}</strong>
            </span>
            {isPendiente ? (
              <span className="navbar-badge pending">⏳ Solicitud en espera</span>
            ) : (
              <button className="navbar-btn outline" onClick={handleDashboard}>
                Mi Panel
              </button>
            )}
            <button className="navbar-btn ghost" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <button className="navbar-btn outline" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button className="navbar-btn filled" onClick={() => navigate('/register')}>
              Registrarse
            </button>
          </>
        )}
      </div>
    </nav>
  );
}