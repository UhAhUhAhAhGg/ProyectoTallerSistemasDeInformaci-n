import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMensaje('');
    setDevToken('');

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al procesar la solicitud');
      setMensaje(data.mensaje);
      if (data.dev_token) setDevToken(data.dev_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button className="login-back-btn" onClick={() => navigate('/login')}>
        ← Volver al login
      </button>

      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-paw">🐾</span>
          <span className="login-brand-name">PetMatch</span>
        </div>

        <h1>Recuperar contraseña</h1>
        <p className="login-subtitle">
          Ingresa tu correo y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>

        {error && <div className="error-banner">{error}</div>}

        {mensaje && (
          <div style={{
            background: '#dcfce7', color: '#166534',
            padding: '12px 16px', borderRadius: 10,
            fontSize: 14, marginBottom: 16, border: '1px solid #bbf7d0'
          }}>
            {mensaje}
          </div>
        )}

        {devToken && (
          <div style={{
            background: '#fef9c3', color: '#713f12',
            padding: '12px 16px', borderRadius: 10,
            fontSize: 13, marginBottom: 16, border: '1px solid #fde68a'
          }}>
            <strong>SOLO EN DESARROLLO — token de reset:</strong>
            <br />
            <code style={{ wordBreak: 'break-all', display: 'block', marginTop: 4 }}>
              {devToken}
            </code>
            <button
              type="button"
              className="login-button"
              style={{ marginTop: 10 }}
              onClick={() => navigate(`/reset-password?token=${devToken}`)}
            >
              Ir a cambiar contraseña
            </button>
          </div>
        )}

        {!mensaje && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                type="email"
                id="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <p className="register-link">
          ¿Ya recordaste tu contraseña?{' '}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
          >
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}