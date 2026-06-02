import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ForgotPasswordPage() {
  const navigate  = useNavigate();
  const [correo, setCorreo]   = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al procesar la solicitud');
      setEnviado(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (enviado) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <span className="login-brand-paw">🐾</span>
            <span className="login-brand-name">PetMatch</span>
          </div>

          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#dcfce7', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, margin: '0 auto 20px',
            }}>
              ✉
            </div>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>Revisa tu correo</h1>
            <p className="login-subtitle" style={{ marginBottom: 4 }}>
              Si <strong>{correo}</strong> está registrado, recibirás un enlace
              para restablecer tu contraseña.
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>
              Revisa también la carpeta de spam si no lo encuentras.
            </p>
            <button
              className="login-button"
              onClick={() => navigate('/login')}
            >
              Volver al inicio de sesión
            </button>
            <p className="register-link" style={{ marginTop: 14 }}>
              ¿No llegó el correo?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setEnviado(false); setCorreo(''); }}
              >
                Intentar de nuevo
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario inicial
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
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && <div className="error-banner">{error}</div>}

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
              autoFocus
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <p className="register-link">
          ¿Ya recordaste tu contraseña?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}