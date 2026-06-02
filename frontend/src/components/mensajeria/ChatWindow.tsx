import { useEffect, useRef, useState } from 'react';
import type { Mensaje, Conversacion } from '../../types/mensajeria.types';
import { enviarMensaje }               from '../../services/mensajeriaService';
import './ChatWindow.css';

interface Props {
  conversacion: Conversacion | null;
  mensajes:     Mensaje[];
  miId:         number;
  onMensajeEnviado: (msg: Mensaje) => void;
}

export default function ChatWindow({
  conversacion,
  mensajes,
  miId,
  onMensajeEnviado,
}: Props) {
  const [texto,    setTexto]    = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje cada vez que cambia la lista
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  if (!conversacion) {
    return (
      <div className="chat-window__placeholder">
        <span>💬</span>
        <p>Selecciona una conversación para comenzar</p>
      </div>
    );
  }

  const nombreOtro =
    conversacion.nom_refug ??
    `${conversacion.nom_adoptante ?? ''} ${conversacion.apell_adoptante ?? ''}`.trim();

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const nuevo = await enviarMensaje({
        contenido:       texto.trim(),
        id_conversacion: conversacion.id_conversacion,
      });
      onMensajeEnviado(nuevo);
      setTexto('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="chat-window">
      {/* Cabecera */}
      <div className="chat-window__header">
        <div className="chat-window__avatar">
          {nombreOtro.charAt(0).toUpperCase()}
        </div>
        <div className="chat-window__header-info">
          <span className="chat-window__nombre">{nombreOtro}</span>
          {conversacion.nom_mascot && (
            <span className="chat-window__mascota">
              🐾 {conversacion.nom_mascot}
            </span>
          )}
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="chat-window__mensajes">
        {mensajes.length === 0 && (
          <p className="chat-window__sin-mensajes">
            Sé el primero en escribir un mensaje
          </p>
        )}

        {mensajes.map((msg) => {
          const esMio = msg.id_remitente === miId;
          return (
            <div
              key={msg.id_mensaje}
              className={`chat-bubble ${esMio ? 'chat-bubble--mio' : 'chat-bubble--otro'}`}
            >
              {!esMio && (
                <span className="chat-bubble__autor">{msg.nom_remitente}</span>
              )}
              <p className="chat-bubble__texto">{msg.contenido}</p>
              <span className="chat-bubble__hora">
                {new Date(msg.fech_mensaje).toLocaleTimeString('es-BO', {
                  hour:   '2-digit',
                  minute: '2-digit',
                })}
                {esMio && (
                  <span className="chat-bubble__leido">
                    {msg.leido ? ' ✓✓' : ' ✓'}
                  </span>
                )}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {error && <p className="chat-window__error">{error}</p>}
      <div className="chat-window__input-area">
        <textarea
          className="chat-window__textarea"
          placeholder="Escribe un mensaje... (Enter para enviar)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={enviando}
        />
        <button
          className="chat-window__btn-enviar"
          onClick={handleEnviar}
          disabled={enviando || !texto.trim()}
        >
          {enviando ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}
