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
      <div className="login-wrapper">
        <div className="login-card">
          <p style={{ color: '#dc2626' }}>Token inválido. Solicita un nuevo enlace de recuperación.</p>
          <button className="login-form__submit" onClick={() => navigate('/forgot-password')}>
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 48 }}>✓</div>
            <h2>¡Contraseña actualizada!</h2>
            <p style={{ color: '#6b7280' }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <button className="login-form__submit" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand__icon">AM</span>
          <h1>Nueva contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-form__label">
            Nueva contraseña
            <input
              type="password"
              className="login-form__input"
              value={form.nueva_contrasena}
              onChange={(e) => setForm((f) => ({ ...f, nueva_contrasena: e.target.value }))}
              placeholder="Mín. 8 chars, mayúscula, número, especial"
              required
            />
          </label>
          <label className="login-form__label">
            Confirmar contraseña
            <input
              type="password"
              className="login-form__input"
              value={form.confirmar_contrasena}
              onChange={(e) => setForm((f) => ({ ...f, confirmar_contrasena: e.target.value }))}
              placeholder="Repite la contraseña"
              required
            />
          </label>

          {error && <p className="login-form__error">{error}</p>}

          <button type="submit" className="login-form__submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}