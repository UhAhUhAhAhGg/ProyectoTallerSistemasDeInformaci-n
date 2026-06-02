import { useNavigate } from 'react-router-dom';
import './PetDetailModal.css';

export interface PetDetailData {
  id_publi?: number;
  id_refug?: number;
  id_mascot: number;
  nom_mascot: string;
  nom_espe: string;
  nom_raza: string;
  edad_mascot: number;
  gen_mascot: boolean;
  esterilizado: boolean;
  img_mascot: string | null;
  descrip_mascot?: string;
  decrip_publi?: string;
  nom_refug?: string;
  dir_refug?: string;
  telf_refug?: string;
}

interface Props {
  pet: PetDetailData;
  onClose: () => void;
  onSolicitar?: () => void;
}

function edadLabel(edad: number): string {
  if (edad <= 1) return 'Cachorro';
  if (edad <= 3) return 'Joven';
  if (edad <= 8) return 'Adulto';
  return 'Senior';
}

export default function PetDetailModal({ pet, onClose, onSolicitar }: Props) {
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');
  const esAdoptante = rol === 'adoptante';
  const descripcion = pet.decrip_publi || pet.descrip_mascot;

  const handleContactar = () => {
    if (pet.id_refug && pet.id_publi) {
      navigate(`/mensajeria?id_refug=${pet.id_refug}&id_publi=${pet.id_publi}`);
    } else if (pet.id_refug) {
      navigate(`/mensajeria?id_refug=${pet.id_refug}`);
    }
    onClose();
  };

  return (
    <div className="pet-detail-overlay" onClick={onClose}>
      <div className="pet-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pet-detail-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="pet-detail-img-wrapper">
          <img
            src={pet.img_mascot || 'https://placehold.co/600x400?text=Sin+foto'}
            alt={pet.nom_mascot}
            className="pet-detail-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Sin+foto';
            }}
          />
        </div>

        <div className="pet-detail-content">
          <div className="pet-detail-header">
            <h2 className="pet-detail-nombre">{pet.nom_mascot}</h2>
            <span className="pet-detail-especie">{pet.nom_espe}</span>
          </div>

          <div className="pet-detail-tags">
            <span className="pet-detail-tag">{pet.nom_raza}</span>
            <span className="pet-detail-tag">
              {edadLabel(pet.edad_mascot)} · {pet.edad_mascot}{' '}
              {pet.edad_mascot === 1 ? 'año' : 'años'}
            </span>
            <span className="pet-detail-tag">{pet.gen_mascot ? 'Macho' : 'Hembra'}</span>
            {pet.esterilizado && (
              <span className="pet-detail-tag pet-detail-tag--verde">Esterilizado/a</span>
            )}
          </div>

          {descripcion && (
            <div className="pet-detail-section">
              <h3>Descripción</h3>
              <p>{descripcion}</p>
            </div>
          )}

          {(pet.nom_refug || pet.dir_refug || pet.telf_refug) && (
            <div className="pet-detail-section pet-detail-refugio">
              <h3>🏠 Refugio</h3>
              {pet.nom_refug && (
                <div className="pet-detail-contact-row">
                  <span>Nombre:</span>
                  <strong>{pet.nom_refug}</strong>
                </div>
              )}
              {pet.dir_refug && (
                <div className="pet-detail-contact-row">
                  <span>Dirección:</span>
                  <strong>{pet.dir_refug}</strong>
                </div>
              )}
              {pet.telf_refug && (
                <div className="pet-detail-contact-row">
                  <span>Teléfono:</span>
                  <strong>{pet.telf_refug}</strong>
                </div>
              )}
            </div>
          )}

          {esAdoptante && pet.id_publi !== undefined && (
            <div className="pet-detail-actions">
              {onSolicitar && (
                <button
                  className="pet-detail-btn pet-detail-btn--primary"
                  onClick={() => { onSolicitar(); onClose(); }}
                >
                  Solicitar adopción
                </button>
              )}
              {pet.id_refug && (
                <button
                  className="pet-detail-btn pet-detail-btn--secondary"
                  onClick={handleContactar}
                >
                  💬 Contactar refugio
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}