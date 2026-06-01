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
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand__icon">AM</span>
          <h1>Recuperar contraseña</h1>
        </div>

        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-form__label">
            Correo electrónico
            <input
              type="email"
              className="login-form__input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </label>

          {error && <p className="login-form__error">{error}</p>}
          {mensaje && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px',
              borderRadius: 8, fontSize: 14, marginBottom: 8 }}>
              {mensaje}
            </div>
          )}
          {devToken && (
            <div style={{ background: '#fef9c3', color: '#713f12', padding: '10px 14px',
              borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
              <strong>SOLO EN DESARROLLO:</strong> Tu token de reset es:
              <br />
              <code style={{ wordBreak: 'break-all' }}>{devToken}</code>
              <br />
              <button
                type="button"
                style={{ marginTop: 8, padding: '4px 12px', background: '#4f46e5', color: '#fff',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                onClick={() => navigate(`/reset-password?token=${devToken}`)}
              >
                Ir a cambiar contraseña
              </button>
            </div>
          )}

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>

        <div className="login-footer">
          <button type="button" className="login-footer__link" onClick={() => navigate('/login')}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}