import { Conversacion } from '../../types/mensajeria.types';
import './ConversacionList.css';

interface Props {
  conversaciones: Conversacion[];
  idSeleccionada: number | null;
  onSeleccionar:  (conv: Conversacion) => void;
  miId:           number;
}

export default function ConversacionList({
  conversaciones,
  idSeleccionada,
  onSeleccionar,
  miId,
}: Props) {
  if (conversaciones.length === 0) {
    return (
      <div className="conv-list__empty">
        <span>💬</span>
        <p>No tienes conversaciones aún</p>
      </div>
    );
  }

  return (
    <ul className="conv-list">
      {conversaciones.map((conv) => {
        const nombre =
          conv.nom_refug ??
          `${conv.nom_adoptante ?? ''} ${conv.apell_adoptante ?? ''}`.trim();

        const subtitulo = conv.nom_mascot
          ? `Sobre: ${conv.nom_mascot}`
          : 'Conversación general';

        const activa = conv.id_conversacion === idSeleccionada;

        return (
          <li
            key={conv.id_conversacion}
            className={`conv-list__item ${activa ? 'conv-list__item--activa' : ''}`}
            onClick={() => onSeleccionar(conv)}
          >
            <div className="conv-list__avatar">
              {nombre.charAt(0).toUpperCase()}
            </div>

            <div className="conv-list__info">
              <span className="conv-list__nombre">{nombre}</span>
              <span className="conv-list__subtitulo">{subtitulo}</span>
            </div>

            {conv.no_leidos > 0 && (
              <span className="conv-list__badge">{conv.no_leidos}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
