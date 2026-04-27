// frontend/src/pages/registro/RegisterAdoptanteMF.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

interface Props {
  onSuccess?: () => void;
  onSwitchToRefugio?: () => void;
}

const field: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14,
};
const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px',
};
const input: React.CSSProperties = {
  padding: '11px 14px', border: '2px solid #e8e8e8', borderRadius: 10,
  fontSize: 14, fontFamily: 'DM Sans, sans-serif', background: '#fafafa',
  color: '#1a1a1a', transition: 'border-color 0.2s', outline: 'none',
};
const errStyle: React.CSSProperties = { fontSize: 11, color: '#e53e3e', marginTop: 2 };

export default function RegisterAdoptanteMF({ onSuccess, onSwitchToRefugio }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', correo: '', telefono: '',
    direccion: '', contrasena: '', confirmacion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pwReqs, setPwReqs] = useState({ length: false, upper: false, num: false, special: false });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'contrasena') {
      setPwReqs({
        length: value.length >= 12,
        upper: /[A-Z]/.test(value),
        num: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value),
      });
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim())   e.nombre = 'Requerido';
    if (!form.apellido.trim()) e.apellido = 'Requerido';
    if (!form.correo.trim())   e.correo = 'Requerido';
    if (!pwReqs.length || !pwReqs.upper || !pwReqs.num || !pwReqs.special)
      e.contrasena = 'No cumple los requisitos';
    if (form.contrasena !== form.confirmacion) e.confirmacion = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.register({
        correo: form.correo,
        contrasena: form.contrasena,
        confirmar_contrasena: form.confirmacion,
        rol: 'adoptante',
        nombre: form.nombre,
        apellido: form.apellido,
      });
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('rol', res.data.rol);
        localStorage.setItem('userId', res.data.id_usuario);
        localStorage.setItem('nombre', form.nombre);
        localStorage.setItem('est_usuario', res.data.est_usuario || 'incompleto');
        onSuccess?.();
        navigate('/completar-perfil/adoptante');
      }
    } catch (err: any) {
      setErrors({ general: err.response?.data?.mensaje || 'Error al registrar' });
    } finally {
      setLoading(false);
    }
  };

  const allMet = pwReqs.length && pwReqs.upper && pwReqs.num && pwReqs.special;

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 900, margin: '0 0 4px', color: '#1a1a1a', letterSpacing: '-0.4px' }}>
          🐾 Registro adoptante
        </h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Crea tu cuenta para encontrar a tu compañero ideal</p>
      </div>

      {errors.general && (
        <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {errors.general}
        </div>
      )}

      {/* Nombre + Apellido */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label} htmlFor="ra-nombre">Nombre</label>
          <input id="ra-nombre" name="nombre" type="text" autoComplete="given-name"
            value={form.nombre} onChange={onChange} placeholder="Tu nombre"
            style={{ ...input, borderColor: errors.nombre ? '#e53e3e' : '#e8e8e8' }} />
          {errors.nombre && <span style={errStyle}>{errors.nombre}</span>}
        </div>
        <div style={field}>
          <label style={label} htmlFor="ra-apellido">Apellido</label>
          <input id="ra-apellido" name="apellido" type="text" autoComplete="family-name"
            value={form.apellido} onChange={onChange} placeholder="Tu apellido"
            style={{ ...input, borderColor: errors.apellido ? '#e53e3e' : '#e8e8e8' }} />
          {errors.apellido && <span style={errStyle}>{errors.apellido}</span>}
        </div>
      </div>

      {/* Correo */}
      <div style={field}>
        <label style={label} htmlFor="ra-correo">Correo electrónico</label>
        <input id="ra-correo" name="correo" type="email" autoComplete="email"
          value={form.correo} onChange={onChange} placeholder="tu@correo.com"
          style={{ ...input, borderColor: errors.correo ? '#e53e3e' : '#e8e8e8' }} />
        {errors.correo && <span style={errStyle}>{errors.correo}</span>}
      </div>

      {/* Teléfono + Dirección */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label} htmlFor="ra-telefono">Teléfono</label>
          <input id="ra-telefono" name="telefono" type="tel" autoComplete="tel"
            value={form.telefono} onChange={onChange} placeholder="+591 7xxxxxxx"
            style={input} />
        </div>
        <div style={field}>
          <label style={label} htmlFor="ra-direccion">Dirección / zona</label>
          <input id="ra-direccion" name="direccion" type="text" autoComplete="street-address"
            value={form.direccion} onChange={onChange} placeholder="Zona Sur, La Paz"
            style={input} />
        </div>
      </div>

      {/* Contraseña */}
      <div style={field}>
        <label style={label} htmlFor="ra-contrasena">Contraseña</label>
        <input id="ra-contrasena" name="contrasena" type="password" autoComplete="new-password"
          value={form.contrasena} onChange={onChange} placeholder="Mínimo 12 caracteres"
          style={{ ...input, borderColor: errors.contrasena ? '#e53e3e' : '#e8e8e8' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
          {[
            { ok: pwReqs.length,  txt: '12 caracteres' },
            { ok: pwReqs.upper,   txt: 'Mayúscula' },
            { ok: pwReqs.num,     txt: 'Número' },
            { ok: pwReqs.special, txt: 'Especial (!@#...)' },
          ].map(r => (
            <span key={r.txt} style={{ fontSize: 11, color: r.ok ? '#4caf50' : '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              {r.ok ? '✓' : '○'} {r.txt}
            </span>
          ))}
        </div>
        {errors.contrasena && <span style={errStyle}>{errors.contrasena}</span>}
      </div>

      {/* Confirmación */}
      <div style={field}>
        <label style={label} htmlFor="ra-confirmacion">Confirmación</label>
        <input id="ra-confirmacion" name="confirmacion" type="password" autoComplete="new-password"
          value={form.confirmacion} onChange={onChange} placeholder="Repite tu contraseña"
          style={{ ...input, borderColor: errors.confirmacion ? '#e53e3e' : '#e8e8e8' }} />
        {errors.confirmacion && <span style={errStyle}>{errors.confirmacion}</span>}
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading || !allMet} style={{
        width: '100%', padding: '13px', background: allMet ? '#1a1a1a' : '#ccc',
        color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
        cursor: allMet && !loading ? 'pointer' : 'not-allowed',
        fontFamily: 'DM Sans, sans-serif', marginTop: 4, transition: 'background 0.2s',
      }}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>

      {/* Login hint */}
      <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: '14px 0 12px' }}>
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={() => navigate('/login')}
          style={{ background: 'none', border: 'none', color: '#96c6b5', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
          Inicia sesión
        </button>
      </p>

      {/* Switch to Refugio */}
      <button type="button" onClick={onSwitchToRefugio} style={{
        width: '100%', padding: '12px', background: '#e4adcc', border: 'none',
        borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', color: '#1a1a1a', transition: 'background 0.2s',
      }}>
        Registro Como Refugio
      </button>
    </form>
  );
}