import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getRecomendaciones } from '../services/pets.service';
import './MatchingPage.css';

interface Recomendacion {
  id_publi: number;
  score: number;
  motivos: string[];
  alertas: string[];
  fuente: string;
  listo_para_ia: boolean;
  mascota: {
    nombre: string;
    edad: number;
    edad_categoria: string;
    especie: string;
    raza: string;
    imagen?: string;
  };
  refugio: {
    nombre: string;
    direccion: string;
  };
}

export default function MatchingPage() {
  const navigate = useNavigate();
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRecomendaciones()
      .then(setRecomendaciones)
      .catch((err: Error) => setError(err.message || 'No se pudieron cargar las recomendaciones'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="match-wrapper">
      <Navbar />
      <main className="match-main">
        <section className="match-header">
          <div>
            <span className="match-kicker">Matching IA</span>
            <h1>Recomendaciones para ti</h1>
            <p>
              Esta vista ya usa tu perfil y las mascotas disponibles. Mas adelante conectaremos aqui la API de IA para
              refinar el ranking y explicar cada coincidencia.
            </p>
          </div>
          <button className="match-btn secondary" type="button" onClick={() => navigate('/dashboard/adoptante')}>
            Volver
          </button>
        </section>

        <section className="match-config">
          <div>
            <strong>Motor actual</strong>
            <span>Reglas de compatibilidad listas para integrarse con IA</span>
          </div>
          <div>
            <strong>Endpoint</strong>
            <span>GET /recomendaciones</span>
          </div>
          <div>
            <strong>Estado</strong>
            <span>Preparado para API externa</span>
          </div>
        </section>

        {loading && <div className="match-empty">Calculando recomendaciones...</div>}
        {error && <div className="match-error">{error}</div>}

        {!loading && !error && recomendaciones.length === 0 && (
          <div className="match-empty">
            <h2>Sin recomendaciones aun</h2>
            <p>Completa tu perfil de adoptante o revisa que existan mascotas publicadas para generar matches.</p>
            <button className="match-btn primary" type="button" onClick={() => navigate('/completar-perfil/adoptante')}>
              Actualizar perfil
            </button>
          </div>
        )}

        {!loading && recomendaciones.length > 0 && (
          <div className="match-list">
            {recomendaciones.map((item) => (
              <article className="match-card" key={item.id_publi}>
                <div className="match-score">
                  <strong>{item.score}%</strong>
                  <span>match</span>
                </div>
                <div className="match-card__body">
                  <div className="match-card__title">
                    <h2>{item.mascota.nombre}</h2>
                    <span>{item.mascota.especie} - {item.mascota.raza}</span>
                  </div>
                  <p className="match-card__meta">
                    {item.mascota.edad_categoria} · {item.mascota.edad} anios · {item.refugio.nombre}
                  </p>
                  <ul>
                    {item.motivos.slice(0, 2).map((motivo) => (
                      <li key={motivo}>{motivo}</li>
                    ))}
                  </ul>
                  {item.alertas.length > 0 && <p className="match-alert">{item.alertas[0]}</p>}
                </div>
                <button className="match-btn primary" type="button" onClick={() => navigate('/catalogo')}>
                  Ver catalogo
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
