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
    esterilizado: boolean;
  };
  refugio: {
    nombre: string;
    direccion: string;
  };
}

const ScoreBadge = ({ score, fuente }: { score: number; fuente: string }) => {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="match-score" style={{ borderColor: color }}>
      <strong style={{ color }}>{score}%</strong>
      <span>match</span>
      <small style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
        {fuente === 'ia' ? 'IA' : 'reglas'}
      </small>
    </div>
  );
};

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

  const fuenteIA = recomendaciones[0]?.fuente === 'ia';

  return (
    <div className="match-wrapper">
      <Navbar />
      <main className="match-main">
        <section className="match-header">
          <div>
            <span className="match-kicker">Matching {fuenteIA ? 'IA · Groq Llama 3.3' : 'Reglas'}</span>
            <h1>Recomendaciones para ti</h1>
            <p>
              {fuenteIA
                ? 'Las recomendaciones fueron generadas por inteligencia artificial analizando tu perfil y las descripciones de cada mascota.'
                : 'Las recomendaciones se calculan con el motor de reglas. Activa la IA en la configuración del administrador.'}
            </p>
          </div>
          <button className="match-btn secondary" type="button" onClick={() => navigate('/dashboard/adoptante')}>
            Volver
          </button>
        </section>

        <section className="match-config">
          <div>
            <strong>Motor activo</strong>
            <span>{fuenteIA ? 'Groq / Llama 3.3 70B' : 'Motor de reglas'}</span>
          </div>
          <div>
            <strong>Endpoint</strong>
            <span>GET /recomendaciones</span>
          </div>
          <div>
            <strong>Estado</strong>
            <span style={{ color: fuenteIA ? '#16a34a' : '#d97706' }}>
              {fuenteIA ? 'IA activa' : 'Fallback a reglas'}
            </span>
          </div>
        </section>

        {loading && <div className="match-empty">Calculando recomendaciones...</div>}
        {error && <div className="match-error">{error}</div>}

        {!loading && !error && recomendaciones.length === 0 && (
          <div className="match-empty">
            <h2>Sin recomendaciones aún</h2>
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
                <ScoreBadge score={item.score} fuente={item.fuente} />
                <div className="match-card__body">
                  <div className="match-card__title">
                    <h2>{item.mascota.nombre}</h2>
                    <span>{item.mascota.especie} · {item.mascota.raza}</span>
                  </div>
                  <p className="match-card__meta">
                    {item.mascota.edad_categoria} · {item.mascota.edad} años
                    {item.mascota.esterilizado ? ' · Esterilizado/a' : ''}
                    {' · '}{item.refugio.nombre}
                  </p>
                  <ul>
                    {item.motivos.slice(0, 3).map((motivo) => (
                      <li key={motivo} style={{ color: '#16a34a' }}>✓ {motivo}</li>
                    ))}
                  </ul>
                  {item.alertas.length > 0 && (
                    <ul>
                      {item.alertas.slice(0, 2).map((alerta) => (
                        <li key={alerta} className="match-alert">⚠ {alerta}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className="match-btn primary" type="button" onClick={() => navigate('/catalogo')}>
                  Ver catálogo
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}