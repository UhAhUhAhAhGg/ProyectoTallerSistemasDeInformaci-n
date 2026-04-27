import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [estUsuario, setEstUsuario] = useState<string | null>(null);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const est = localStorage.getItem('est_usuario');
    if (nombre) setUserName(nombre);
    if (rol) setUserRol(rol);
    if (est) setEstUsuario(est);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setUserRol(null);
    setEstUsuario(null);
  };

  const handleDashboard = () => {
    if (userRol === 'administrador') navigate('/admin/dashboard');
    else if (userRol === 'adoptante') navigate('/dashboard/adoptante');
    else if (userRol === 'refugio') navigate('/dashboard/refugio');
  };

  const isPendiente = userRol === 'refugio' && estUsuario === 'pendiente';

  return (
    <div className="hp-root">
      {/* NAV */}
      <nav className="hp-nav">
        <div className="hp-nav-brand">
          <span className="hp-paw">🐾</span>
          <span className="hp-brand-name">PetMatch</span>
        </div>
        <div className="hp-nav-links">
          <a href="#como" className="hp-nav-link">¿Cómo funciona?</a>
          <a href="#refugios" className="hp-nav-link">Refugios</a>
        </div>
        <div className="hp-nav-actions">
          {userName ? (
            <>
              <span className="hp-greeting">Hola, <strong>{userName}</strong></span>
              {isPendiente ? (
                <span className="hp-badge-pending">Solicitud en espera</span>
              ) : (
                <button className="hp-btn hp-btn-outline" onClick={handleDashboard}>Mi Panel</button>
              )}
              <button className="hp-btn hp-btn-ghost" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <button className="hp-btn hp-btn-outline" onClick={() => navigate('/login')}>Iniciar sesión</button>
              <button className="hp-btn hp-btn-primary" onClick={() => navigate('/register')}>Registrarse</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-hero-left">
          <p className="hp-hero-tag">Adopción responsable en Bolivia</p>
          <h1 className="hp-hero-title">
            Encuentra tu<br />
            <em>compañero ideal</em>
          </h1>
          <p className="hp-hero-sub">
            Conectamos a mascotas que buscan un hogar con familias que tienen amor para dar.
          </p>
          {isPendiente ? (
            <div className="hp-pending-box">
              <span className="hp-pending-icon">⏳</span>
              <div>
                <strong>Tu solicitud de refugio está en revisión</strong>
                <p>Recibirás una notificación cuando sea aprobada por un administrador.</p>
              </div>
            </div>
          ) : (
            <div className="hp-hero-ctas">
              {userName ? (
                <button className="hp-btn hp-btn-dark" onClick={handleDashboard}>Ir a mi panel →</button>
              ) : (
                <>
                  <button className="hp-btn hp-btn-dark" onClick={() => navigate('/register')}>Quiero adoptar</button>
                  <button className="hp-btn hp-btn-outline" onClick={() => navigate('/login')}>Soy un refugio</button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="hp-stats">
        <div className="hp-stat"><span className="hp-stat-num">500+</span><span className="hp-stat-lbl">Mascotas adoptadas</span></div>
        <div className="hp-stat-divider" />
        <div className="hp-stat"><span className="hp-stat-num">80+</span><span className="hp-stat-lbl">Refugios registrados</span></div>
        <div className="hp-stat-divider" />
        <div className="hp-stat"><span className="hp-stat-num">1200+</span><span className="hp-stat-lbl">Familias felices</span></div>
      </section>

      {/* HOW */}
      <section className="hp-how" id="como">
        <h2 className="hp-section-title">¿Cómo funciona?</h2>
        <div className="hp-steps">
          <div className="hp-step">
            <div className="hp-step-num">01</div>
            <div className="hp-step-icon">📝</div>
            <h3>Regístrate</h3>
            <p>Crea tu cuenta como adoptante o como refugio en minutos.</p>
          </div>
          <div className="hp-step-arrow">→</div>
          <div className="hp-step">
            <div className="hp-step-num">02</div>
            <div className="hp-step-icon">🔍</div>
            <h3>Explora</h3>
            <p>Encuentra mascotas que se adapten a tu estilo de vida.</p>
          </div>
          <div className="hp-step-arrow">→</div>
          <div className="hp-step">
            <div className="hp-step-num">03</div>
            <div className="hp-step-icon">❤️</div>
            <h3>Adopta</h3>
            <p>Envía tu solicitud y dale un hogar a quien lo necesita.</p>
          </div>
        </div>
      </section>

      {/* CTA REFUGIO */}
      {!userName && (
        <section className="hp-cta-section" id="refugios">
          <div className="hp-cta-box">
            <h2>¿Tienes un refugio?</h2>
            <p>Únete a nuestra red y ayuda a más animales a encontrar hogar.</p>
            <button className="hp-btn hp-btn-mint" onClick={() => navigate('/register')}>
              Registrar mi refugio
            </button>
          </div>
        </section>
      )}

      <footer className="hp-footer">
        <span>🐾 PetMatch · Adopción responsable · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}