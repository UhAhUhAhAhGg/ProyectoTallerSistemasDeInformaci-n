import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from './Navbar';
import heroPets from '../assets/hero-pets.png';

const featuredPets = [
  { name: 'Luna', meta: '2 años · Tamaño mediano', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80' },
  { name: 'Michi', meta: '1 año · Tranquilo', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80' },
  { name: 'Rocky', meta: '3 años · Juguetón', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRol, setUserRol] = useState<string | null>(null);
  const [estUsuario, setEstUsuario] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('nombre'));
    setUserRol(localStorage.getItem('rol'));
    setEstUsuario(localStorage.getItem('est_usuario'));
  }, []);

  const handleDashboard = () => {
    if (userRol === 'administrador') navigate('/admin/dashboard');
    else if (userRol === 'adoptante') navigate('/dashboard/adoptante');
    else if (userRol === 'refugio') navigate('/dashboard/refugio');
  };

  const goToRefugeRegister = () => {
    navigate('/register', { state: { role: 'refugio' } });
  };

  const isPendiente = userRol === 'refugio' && estUsuario === 'pendiente';

  return (
    <div className="hp-root">
      <Navbar />

      <main>
        <section className="hp-hero">
          <div className="hp-hero-copy">
            <p className="hp-eyebrow">Adopcion responsable en Bolivia</p>
            <h1>Adopta un amigo para toda la vida</h1>
            <p className="hp-hero-sub">
              Miles de mascotas esperan un hogar lleno de amor. Encuentra companeros cercanos,
              conoce refugios verificados y empieza una adopcion simple y segura.
            </p>

            {isPendiente ? (
              <div className="hp-pending-box">
                <span className="hp-pending-icon">⏳</span>
                <div>
                  <strong>Tu solicitud de refugio esta en revision</strong>
                  <p>Recibiras una notificacion cuando sea aprobada por un administrador.</p>
                </div>
              </div>
            ) : (
              <div className="hp-hero-ctas">
                {userName ? (
                  <button className="hp-btn hp-btn-primary" onClick={handleDashboard}>Ir a mi panel</button>
                ) : (
                  <>
                    <button className="hp-btn hp-btn-primary" onClick={() => navigate('/catalogo')}>Explorar mascotas</button>
                    <button className="hp-btn hp-btn-secondary" onClick={goToRefugeRegister}>Registrar refugio</button>
                  </>
                )}
              </div>
            )}

            <div className="hp-trust-row" aria-label="Indicadores de confianza">
              <span><strong>500+</strong> adopciones</span>
              <span><strong>80+</strong> refugios</span>
              <span><strong>24h</strong> respuesta promedio</span>
            </div>
          </div>

          <div className="hp-hero-visual" aria-label="Mascotas felices listas para adopcion">
            <img src={heroPets} alt="Perro y gato en un hogar calido" />
            <div className="hp-floating-chip hp-chip-top">Refugios verificados</div>
            <div className="hp-floating-chip hp-chip-bottom">Listos para adoptar</div>
          </div>
        </section>

        <section className="hp-featured" id="mascotas">
          <div className="hp-section-heading">
            <p className="hp-eyebrow">Mascotas destacadas</p>
            <h2>Conoce a quienes estan esperando casa</h2>
          </div>
          <div className="hp-pet-grid">
            {featuredPets.map((pet) => (
              <article className="hp-pet-card" key={pet.name}>
                <img src={pet.image} alt={`${pet.name} en adopcion`} />
                <div>
                  <h3>{pet.name}</h3>
                  <p>{pet.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="hp-how" id="como">
          <div className="hp-section-heading">
            <p className="hp-eyebrow">Proceso simple</p>
            <h2>Adoptar deberia sentirse claro desde el primer paso</h2>
          </div>
          <div className="hp-steps">
            <article className="hp-step">
              <span>01</span>
              <h3>Explora</h3>
              <p>Filtra mascotas por especie, tamano, edad y compatibilidad con tu hogar.</p>
            </article>
            <article className="hp-step">
              <span>02</span>
              <h3>Solicita</h3>
              <p>Envia tu solicitud con tu perfil de adoptante ya completado.</p>
            </article>
            <article className="hp-step">
              <span>03</span>
              <h3>Conecta</h3>
              <p>El refugio revisa tu caso y coordina el siguiente paso contigo.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="hp-footer">
        <span>PetMatch · Adopcion responsable · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
