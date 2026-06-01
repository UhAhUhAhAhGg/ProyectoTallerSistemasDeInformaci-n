import { useState } from 'react';
import { solicitudService } from './shared/solicitud.service';

interface Props {
  id_publ: number;
  nom_animal: string;
  onEnviada?: () => void;
  onCancelar?: () => void;
}

export default function EnviarSolicitudMF({
  id_publ, nom_animal, onEnviada, onCancelar,
}: Props) {
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviada, setEnviada] = useState(false);

  const handleEnviar = async () => {
  setLoading(true);
  setError('');
  try {
    await solicitudService.enviar({
      id_publi: id_publ,
      decrip_soli: mensaje.trim() || 'Solicitud de adopción',
    });
    setEnviada(true);
    onEnviada?.();
  } catch {
    setError('No se pudo enviar la solicitud. Intenta de nuevo.');
  } finally {
    setLoading(false);
  }
};

  if (enviada) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'green' }}>
      <p>✅ Solicitud enviada correctamente para <strong>{nom_animal}</strong>.</p>
      <p style={{ fontSize: 13, color: '#555' }}>El refugio revisará tu solicitud pronto.</p>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 480 }}>
      <h3 style={{ marginBottom: 4 }}>Solicitud de adopción</h3>
      <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
        Estás enviando una solicitud para adoptar a <strong>{nom_animal}</strong>.
      </p>
      <label style={{ fontSize: 13, fontWeight: 600 }}>
        Mensaje al refugio (opcional)
      </label>
      <textarea
        rows={4}
        value={mensaje}
        onChange={e => setMensaje(e.target.value)}
        placeholder="Cuéntales sobre ti, tu hogar, experiencia con animales..."
        style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 6,
          border: '1px solid #ccc', fontSize: 14, resize: 'vertical' }}
      />
      {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          onClick={handleEnviar} disabled={loading}
          style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none',
            padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
        <button
          onClick={onCancelar}
          style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ccc',
            background: '#fff', cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}