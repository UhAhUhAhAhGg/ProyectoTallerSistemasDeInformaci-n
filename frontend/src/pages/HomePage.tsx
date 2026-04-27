// filepath: src/pages/HomePage.tsx
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
    <div className="home-wrapper">
      {/* NAVBAR */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <span className="home-nav-paw">🐾</span>
          <span className="home-nav-title">PetMatch</span>
        </div>
        <div className="home-nav-actions">
          {userName ? (
            <>
              <span className="home-nav-user">
                <span className="home-nav-user-dot" />
                Hola, <strong>{userName}</strong>
              </span>
              {isPendiente ? (
                <span className="home-nav-badge pending">⏳ Solicitud en espera</span>
              ) : (
                <button className="home-nav-btn outline" onClick={handleDashboard}>
                  Mi Panel
                </button>
              )}
              <button className="home-nav-btn ghost" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <button className="home-nav-btn outline" onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
              <button className="home-nav-btn filled" onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="home-hero-content">
          <div className="home-hero-tag">Plataforma de adopción responsable</div>
          <h1 className="home-hero-title">
            Encuentra tu<br />
            <span className="home-hero-accent">compañero ideal</span>
          </h1>
          <p className="home-hero-desc">
            Conectamos a mascotas que buscan un hogar con familias que tienen amor para dar.
            Miles de animales esperan conocerte.
          </p>
          {isPendiente ? (
            <div className="home-pending-banner">
              <span className="home-pending-icon">⏳</span>
              <div>
                <strong>Tu solicitud de refugio está en revisión</strong>
                <p>Recibirás una notificación cuando sea aprobada por un administrador.</p>
              </div>
            </div>
          ) : (
            <div className="home-hero-ctas">
              {userName ? (
                <button className="home-cta-primary" onClick={handleDashboard}>
                  Ir a mi panel →
                </button>
              ) : (
                <>
                  <button className="home-cta-primary" onClick={() => navigate('/register')}>
                    Quiero adoptar
                  </button>
                  <button className="home-cta-secondary" onClick={() => navigate('/login')}>
                    Soy un refugio
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="home-hero-visual">
          <div className="home-hero-card">
            <div className="home-hero-card-img">🐕</div>
            <div className="home-hero-card-info">
              <span className="home-hero-card-name">Luna</span>
              <span className="home-hero-card-breed">Labrador · 2 años</span>
              <span className="home-hero-card-status">Disponible</span>
            </div>
          </div>
          <div className="home-hero-card home-hero-card-offset">
            <div className="home-hero-card-img">🐈</div>
            <div className="home-hero-card-info">
              <span className="home-hero-card-name">Milo</span>
              <span className="home-hero-card-breed">Gato mestizo · 1 año</span>
              <span className="home-hero-card-status">Disponible</span>
            </div>
          </div>
          <div className="home-hero-card home-hero-card-offset2">
            <div className="home-hero-card-img">🐇</div>
            <div className="home-hero-card-info">
              <span className="home-hero-card-name">Coco</span>
              <span className="home-hero-card-breed">Conejo · 8 meses</span>
              <span className="home-hero-card-status">Disponible</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats">
        <div className="home-stat">
          <span className="home-stat-num">500+</span>
          <span className="home-stat-label">Mascotas adoptadas</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat">
          <span className="home-stat-num">80+</span>
          <span className="home-stat-label">Refugios registrados</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat">
          <span className="home-stat-num">1200+</span>
          <span className="home-stat-label">Familias felices</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-how">
        <h2 className="home-section-title">¿Cómo funciona?</h2>
        <div className="home-steps">
          <div className="home-step">
            <div className="home-step-num">01</div>
            <div className="home-step-icon">📝</div>
            <h3>Regístrate</h3>
            <p>Crea tu cuenta como adoptante o como refugio en minutos.</p>
          </div>
          <div className="home-step-arrow">→</div>
          <div className="home-step">
            <div className="home-step-num">02</div>
            <div className="home-step-icon">🔍</div>
            <h3>Explora</h3>
            <p>Encuentra mascotas que se adapten a tu estilo de vida.</p>
          </div>
          <div className="home-step-arrow">→</div>
          <div className="home-step">
            <div className="home-step-num">03</div>
            <div className="home-step-icon">❤️</div>
            <h3>Adopta</h3>
            <p>Envía tu solicitud y dale un hogar a quien lo necesita.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      {!userName && (
        <section className="home-cta-section">
          <div className="home-cta-box">
            <h2>¿Tienes un refugio?</h2>
            <p>Únete a nuestra red y ayuda a más animales a encontrar hogar.</p>
            <button className="home-cta-primary light" onClick={() => navigate('/register')}>
              Registrar mi refugio
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="home-footer">
        <span>🐾 PetMatch · Adopción responsable · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}