import { useEffect, useState } from 'react';
import { useSearchParams }     from 'react-router-dom';
import Navbar                  from './Navbar';
import ConversacionList        from '../components/mensajeria/ConversacionList';
import ChatWindow              from '../components/mensajeria/ChatWindow';
import {
  getConversaciones,
  getMensajes,
  enviarMensaje,
  marcarLeidos,
} from '../services/mensajeriaService';
import type { Conversacion, Mensaje } from '../types/mensajeria.types';
import './MensajeriaPage.css';

export default function MensajeriaPage() {
  const [searchParams]                              = useSearchParams();
  const [conversaciones, setConversaciones]         = useState<Conversacion[]>([]);
  const [seleccionada,   setSeleccionada]           = useState<Conversacion | null>(null);
  const [mensajes,       setMensajes]               = useState<Mensaje[]>([]);
  const [cargando,       setCargando]               = useState(true);
  const [error,          setError]                  = useState<string | null>(null);

  // Obtener id del usuario del token
  const miId: number = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      return JSON.parse(atob(token.split('.')[1])).id ?? 0;
    } catch { return 0; }
  })();

  // Cargar conversaciones al montar
  useEffect(() => {
    cargarConversaciones();
  }, []);

  // Si viene id_refug por query param (botón "Contactar refugio"),
  // crear/abrir la conversación automáticamente
  useEffect(() => {
    const id_refug = searchParams.get('id_refug');
    const id_publi = searchParams.get('id_publi');
    if (!id_refug || conversaciones.length === 0) return;

    const existente = conversaciones.find(
      (c) =>
        c.id_refug === Number(id_refug) &&
        (id_publi ? c.id_publi === Number(id_publi) : true),
    );

    if (existente) {
      handleSeleccionar(existente);
    } else {
      // Iniciar conversación nueva enviando primer mensaje vacío no es correcto;
      // simplemente pre-seleccionamos con un objeto temporal para que el
      // ChatWindow muestre la cabecera y el usuario pueda escribir.
      iniciarConversacionNueva(Number(id_refug), id_publi ? Number(id_publi) : undefined);
    }
  }, [conversaciones, searchParams]);

  const cargarConversaciones = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getConversaciones();
      setConversaciones(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones');
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionar = async (conv: Conversacion) => {
    setSeleccionada(conv);
    try {
      const msgs = await getMensajes(conv.id_conversacion);
      setMensajes(msgs);
      await marcarLeidos(conv.id_conversacion);
      // Actualizar badge local
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === conv.id_conversacion
            ? { ...c, no_leidos: 0 }
            : c,
        ),
      );
    } catch {
      setMensajes([]);
    }
  };

  /**
   * Cuando viene desde "Contactar refugio" y no existe conversación previa,
   * creamos un objeto temporal para mostrar la cabecera del chat.
   * La conversación real se crea en el backend al enviar el primer mensaje.
   */
  const iniciarConversacionNueva = (id_refug: number, id_publi?: number) => {
    const temporal: Conversacion = {
      id_conversacion:      -1,             // valor centinela
      id_usuario_adoptante: miId,
      id_refug,
      id_publi:             id_publi ?? null,
      fech_creacion:        new Date().toISOString(),
      ultimo_mensaje:       null,
      nom_refug:            'Refugio',      // se actualizará al recargar
      no_leidos:            0,
    };
    setSeleccionada(temporal);
    setMensajes([]);
  };

  const handleMensajeEnviado = async (msg: Mensaje) => {
    setMensajes((prev) => [...prev, msg]);

    // Si era conversación nueva (id -1), recargar lista para obtener la real
    if (seleccionada?.id_conversacion === -1) {
      const data = await getConversaciones();
      setConversaciones(data);
      // Seleccionar la conversación recién creada
      const nueva = data.find(
        (c: Conversacion) =>
          c.id_refug === seleccionada.id_refug &&
          c.id_publi === seleccionada.id_publi,
      );
      if (nueva) setSeleccionada(nueva);
    }
  };

  return (
    <div className="mensajeria-wrapper">
      <Navbar />
      <div className="mensajeria-layout">
        {/* Panel izquierdo — lista */}
        <aside className="mensajeria-sidebar">
          <h2 className="mensajeria-sidebar__titulo">Mensajes</h2>
          {cargando && <p className="mensajeria-sidebar__cargando">Cargando...</p>}
          {error   && <p className="mensajeria-sidebar__error">{error}</p>}
          {!cargando && !error && (
            <ConversacionList
              conversaciones={conversaciones}
              idSeleccionada={seleccionada?.id_conversacion ?? null}
              onSeleccionar={handleSeleccionar}
              miId={miId}
            />
          )}
        </aside>

        {/* Panel derecho — chat */}
        <main className="mensajeria-chat">
          <ChatWindow
            conversacion={seleccionada}
            mensajes={mensajes}
            miId={miId}
            onMensajeEnviado={handleMensajeEnviado}
          />
        </main>
      </div>
    </div>
  );
}
