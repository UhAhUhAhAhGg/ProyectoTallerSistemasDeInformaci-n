// filepath: src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.correo || !formData.contrasena) {
      setError('Todos los campos son requeridos');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(formData.correo, formData.contrasena);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('rol', response.data.rol);
        localStorage.setItem('userId', response.data.id_usuario);
        localStorage.setItem('est_usuario', response.data.est_usuario);
        // ✅ Guardar nombre para mostrarlo en la navbar/home
        localStorage.setItem('nombre', response.data.nombre || response.data.correo || 'Usuario');

        const rol = response.data.rol;
        const est = response.data.est_usuario;

        switch (rol) {
          case 'administrador':
            navigate('/admin/dashboard');
            break;
          case 'adoptante':
            if (est === 'incompleto') navigate('/completar-perfil/adoptante');
            else navigate('/dashboard/adoptante');
            break;
          case 'refugio':
            if (est === 'incompleto') navigate('/completar-perfil/refugio');
            else navigate('/'); // ← Pendiente/activo/rechazado van al inicio
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Back to home */}
      <button className="login-back-btn" onClick={() => navigate('/')}>
        ← Volver al inicio
      </button>

      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-paw">🐾</span>
          <span className="login-brand-name">PetMatch</span>
        </div>
        <h1>Bienvenido de vuelta</h1>
        <p className="login-subtitle">Inicia sesión en tu cuenta</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="register-link">
          ¿No tienes cuenta? <a href="/register">Registrarse</a>
        </p>
      </div>
    </div>
  );
}