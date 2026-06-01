import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroPets from '../assets/hero-pets.png';
import { refugioService } from '../services/api';
import './HomePage.css';
import Navbar from './Navbar';

const featuredPets = [
  { name: 'Luna', meta: '2 años · Tamaño mediano', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80' },
  { name: 'Michi', meta: '1 año · Tranquilo', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80' },
  { name: 'Rocky', meta: '3 años · Juguetón', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('nombre'));
  const [userRol, setUserRol] = useState<string | null>(() => localStorage.getItem('rol'));
  const [estUsuario, setEstUsuario] = useState<string | null>(() => localStorage.getItem('est_usuario'));

  // Polling para detectar cambios en localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      setUserName(localStorage.getItem('nombre'));
      setUserRol(localStorage.getItem('rol'));
      setEstUsuario(localStorage.getItem('est_usuario'));
    }, 300);

    return () => clearInterval(interval);
  }, []);

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
            
            {/* 🧪 BOTÓN DE PRUEBA */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffe0e6', borderRadius: '5px', textAlign: 'left', border: '2px solid #d4437d' }}>
              <p style={{ fontSize: '14px', margin: '5px 0', fontWeight: 'bold', color: '#d4437d' }}>
                🔍 DEBUG INFO:
              </p>
              <p style={{ fontSize: '12px', margin: '3px 0', color: '#333' }}>
                rol = "{userRol}" {userRol === 'adoptante' ? '✅' : userRol === 'refugio' ? '✅' : '❌'}
              </p>
              <p style={{ fontSize: '12px', margin: '3px 0', color: '#333' }}>
                estado = "{estUsuario}" {estUsuario === 'activo' ? '✅' : estUsuario === 'incompleto' ? '⚠️' : '❌'}
              </p>
              <p style={{ fontSize: '12px', margin: '3px 0', color: '#333' }}>
                nombre = "{userName}" {userName ? '✅' : '❌'}
              </p>
              <p style={{ fontSize: '12px', margin: '10px 0 0 0', fontWeight: 'bold', color: '#d4437d' }}>
                Condición: (rol=adoptante) OR (rol=refugio AND estado=activo)
              </p>
              
              {(userRol === 'adoptante' || (userRol === 'refugio' && estUsuario === 'activo')) && (
                <button 
                  style={{ 
                    backgroundColor: '#d4437d', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    fontWeight: 'bold'
                  }}
                  onClick={() => navigate('/adaptacion-seguimiento')}
                >
                  {userRol === 'refugio' ? '🔬 PRUEBA: Observaciones' : '🔬 PRUEBA: Seguimiento'}
                </button>
              )}
              {!((userRol === 'adoptante' || (userRol === 'refugio' && estUsuario === 'activo')) && userName) && (
                <p style={{ fontSize: '12px', margin: '10px 0 0 0', color: '#999' }}>
                  ⚠️ Botón NO visible - condición no se cumple
                </p>
              )}
            </div>
            
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
