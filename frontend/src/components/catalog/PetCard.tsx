import { useNavigate } from 'react-router-dom';
import './PetCard.css';

interface PetCardProps {
  id_publi:    number;
  id_refug:    number;
  id_mascot:   number;
  nom_mascot:  string;
  nom_espe:    string;
  nom_raza:    string;
  edad_mascot: number;
  gen_mascot:  boolean;
  esterilizado: boolean;
  img_mascot:  string;
  nom_refug:   string;
  dir_refug?:  string;
  // matching opcional
  score?:      number;
  motivos?:    string[];
  alertas?:    string[];
}

function edadLabel(edad: number): string {
  if (edad <= 1) return 'Cachorro';
  if (edad <= 3) return 'Joven';
  if (edad <= 8) return 'Adulto';
  return 'Senior';
}

function scoreColor(score: number): string {
  if (score >= 75) return '#38a169';
  if (score >= 50) return '#d69e2e';
  return '#e53e3e';
}

export default function PetCard(props: PetCardProps) {
  const navigate  = useNavigate();
  const rol       = localStorage.getItem('rol');
  const esAdoptante = rol === 'adoptante';

  const handleContactar = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(
      `/mensajeria?id_refug=${props.id_refug}&id_publi=${props.id_publi}`,
    );
  };

  return (
    <div className="pet-card">
      <div className="pet-card__img-wrapper">
        <img
          src={props.img_mascot}
          alt={props.nom_mascot}
          className="pet-card__img"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300?text=Sin+foto';
          }}
        />
        {props.score !== undefined && (
          <span
            className="pet-card__score"
            style={{ background: scoreColor(props.score) }}
          >
            {props.score}% compatible
          </span>
        )}
      </div>

      <div className="pet-card__body">
        <div className="pet-card__header">
          <h3 className="pet-card__nombre">{props.nom_mascot}</h3>
          <span className="pet-card__especie">{props.nom_espe}</span>
        </div>

        <div className="pet-card__tags">
          <span className="pet-card__tag">{props.nom_raza}</span>
          <span className="pet-card__tag">{edadLabel(props.edad_mascot)} · {props.edad_mascot} {props.edad_mascot === 1 ? 'año' : 'años'}</span>
          <span className="pet-card__tag">{props.gen_mascot ? 'Macho' : 'Hembra'}</span>
          {props.esterilizado && (
            <span className="pet-card__tag pet-card__tag--verde">Esterilizado</span>
          )}
        </div>

        <p className="pet-card__refugio">🏠 {props.nom_refug}</p>

        {props.motivos && props.motivos.length > 0 && (
          <ul className="pet-card__motivos">
            {props.motivos.slice(0, 2).map((m, i) => (
              <li key={i} className="pet-card__motivo pet-card__motivo--ok">✓ {m}</li>
            ))}
          </ul>
        )}

        {props.alertas && props.alertas.length > 0 && (
          <ul className="pet-card__motivos">
            {props.alertas.slice(0, 1).map((a, i) => (
              <li key={i} className="pet-card__motivo pet-card__motivo--alerta">⚠ {a}</li>
            ))}
          </ul>
        )}

        {esAdoptante && (
          <button
            className="pet-card__btn-contactar"
            onClick={handleContactar}
          >
            💬 Contactar refugio
          </button>
        )}
      </div>
    </div>
  );
}
