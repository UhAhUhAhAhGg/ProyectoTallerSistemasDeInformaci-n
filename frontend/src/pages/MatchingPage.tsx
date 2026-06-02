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

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const bg    = score >= 75 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fff5f5';
  return (
    <div className="match-score" style={{ borderColor: color, background: bg }}>
      <strong style={{ color }}>{score}%</strong>
      <span>match</span>
    </div>
  );
};

export default function MatchingPage() {
  const navigate = useNavigate();
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [mensajeApi, setMensajeApi]           = useState('');
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');

  useEffect(() => {
    getRecomendaciones()
      .then(({ data, mensaje }) => {
        setRecomendaciones(data as Recomendacion[]);
        setMensajeApi(mensaje);
      })
      .catch((err: Error) => setError(err.message || 'No se pudieron cargar las recomendaciones'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="match-wrapper">
      <Navbar />
      <main className="match-main">
        <section className="match-header">
          <div>
            <span className="match-kicker">Matching con IA</span>
            <h1>Mascotas recomendadas para ti</h1>
            <p>
              Analizamos tu perfil y te mostramos las mascotas con mayor compatibilidad.
              Cuanto más completo sea tu perfil, mejores serán los resultados.
            </p>
          </div>
          <button
            className="match-btn secondary"
            type="button"
            onClick={() => navigate('/dashboard/adoptante')}
          >
            ← Volver
          </button>
        </section>

        {loading && (
          <div className="match-empty">
            <p>Calculando tus mejores matches...</p>
          </div>
        )}

        {error && (
          <div className="match-error">
            <strong>No se pudieron cargar las recomendaciones</strong>
            <p style={{ marginTop: 8, fontSize: 14 }}>{error}</p>
            <button
              className="match-btn primary"
              style={{ marginTop: 16 }}
              type="button"
              onClick={() => navigate('/completar-perfil/adoptante')}
            >
              Revisar perfil
            </button>
          </div>
        )}

        {!loading && !error && recomendaciones.length === 0 && (
          <div className="match-empty">
            <h2>Sin recomendaciones por ahora</h2>
            <p>
              {mensajeApi || 'Completa tu perfil para recibir sugerencias personalizadas.'}
            </p>
            {mensajeApi.toLowerCase().includes('perfil') ? (
              <button
                className="match-btn primary"
                type="button"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/completar-perfil/adoptante')}
              >
                Completar perfil
              </button>
            ) : (
              <button
                className="match-btn secondary"
                type="button"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/catalogo')}
              >
                Ver catálogo completo
              </button>
            )}
          </div>
        )}

        {!loading && recomendaciones.length > 0 && (
          <>
            <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
              {recomendaciones.length} mascota{recomendaciones.length !== 1 ? 's' : ''} compatible{recomendaciones.length !== 1 ? 's' : ''} con tu perfil
            </p>
            <div className="match-list">
              {recomendaciones.map((item) => (
                <article className="match-card" key={item.id_publi}>
                  <ScoreBadge score={item.score} />
                  <div className="match-card__body">
                    <div className="match-card__title">
                      <h2>{item.mascota.nombre}</h2>
                      <span>{item.mascota.especie} · {item.mascota.raza}</span>
                    </div>
                    <p className="match-card__meta">
                      {item.mascota.edad_categoria} · {item.mascota.edad} año{item.mascota.edad !== 1 ? 's' : ''}
                      {item.mascota.esterilizado ? ' · Esterilizado/a' : ''}
                      {' · '}{item.refugio.nombre}
                    </p>
                    {item.motivos.length > 0 && (
                      <ul>
                        {item.motivos.slice(0, 3).map((motivo) => (
                          <li key={motivo} style={{ color: '#16a34a' }}>✓ {motivo}</li>
                        ))}
                      </ul>
                    )}
                    {item.alertas.length > 0 && (
                      <ul style={{ marginTop: 4 }}>
                        {item.alertas.slice(0, 2).map((alerta) => (
                          <li key={alerta} className="match-alert">⚠ {alerta}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    className="match-btn primary"
                    type="button"
                    onClick={() => navigate('/catalogo')}
                  >
                    Ver en catálogo
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}