import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './LoginPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [form, setForm] = useState({ nueva_contrasena: '', confirmar_contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nueva_contrasena !== form.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al restablecer');
      setExito(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <span className="login-brand-paw">🐾</span>
            <span className="login-brand-name">PetMatch</span>
          </div>
          <div className="error-banner">
            Token inválido. Solicita un nuevo enlace de recuperación.
          </div>
          <button
            className="login-button"
            style={{ marginTop: 16 }}
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#dcfce7', color: '#166534',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, margin: '0 auto 20px'
            }}>
              ✓
            </div>
            <h1>¡Contraseña actualizada!</h1>
            <p className="login-subtitle">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button className="login-button" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <button className="login-back-btn" onClick={() => navigate('/forgot-password')}>
        ← Volver
      </button>

      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-paw">🐾</span>
          <span className="login-brand-name">PetMatch</span>
        </div>
        <h1>Nueva contraseña</h1>
        <p className="login-subtitle">
          Crea una contraseña segura: mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nueva_contrasena">Nueva contraseña</label>
            <input
              type="password"
              id="nueva_contrasena"
              value={form.nueva_contrasena}
              onChange={(e) => setForm((f) => ({ ...f, nueva_contrasena: e.target.value }))}
              placeholder="Ej: MiPerro2024!"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmar_contrasena">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmar_contrasena"
              value={form.confirmar_contrasena}
              onChange={(e) => setForm((f) => ({ ...f, confirmar_contrasena: e.target.value }))}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}