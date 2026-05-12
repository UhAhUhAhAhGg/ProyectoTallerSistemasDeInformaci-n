import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, authService } from '../../services/api';

interface Props {
  onSuccess?: () => void;
}

const field: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  marginBottom: 14,
};

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const input: React.CSSProperties = {
  padding: '11px 14px',
  border: '2px solid #e8e8e8',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  background: '#fafafa',
  color: '#1a1a1a',
  transition: 'border-color 0.2s',
  outline: 'none',
};

const errStyle: React.CSSProperties = { fontSize: 11, color: '#e53e3e', marginTop: 2 };

const getErrorMessage = (err: unknown) => {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: { data?: { mensaje?: unknown } } }).response?.data?.mensaje === 'string'
  ) {
    return (err as { response: { data: { mensaje: string } } }).response.data.mensaje;
  }

  return 'Error al registrar el refugio';
};

export default function RegisterRefugioMF({ onSuccess }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    nombreRefugio: '',
    correo: '',
    telefono: '',
    direccion: '',
    licencia: '',
    descripcion: '',
    contrasena: '',
    confirmacion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pwReqs, setPwReqs] = useState({
    length: false,
    upper: false,
    num: false,
    special: false,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'contrasena') {
      setPwReqs({
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        num: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value),
      });
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.nombreRefugio.trim()) nextErrors.nombreRefugio = 'Requerido';
    if (!form.correo.trim()) nextErrors.correo = 'Requerido';
    if (!form.telefono.trim()) nextErrors.telefono = 'Requerido';
    if (!form.direccion.trim()) nextErrors.direccion = 'Requerido';
    if (!form.licencia.trim()) nextErrors.licencia = 'Requerido';
    if (!pwReqs.length || !pwReqs.upper || !pwReqs.num || !pwReqs.special) {
      nextErrors.contrasena = 'No cumple los requisitos';
    }
    if (form.contrasena !== form.confirmacion) {
      nextErrors.confirmacion = 'Las contrasenas no coinciden';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await authService.register({
        correo: form.correo,
        contrasena: form.contrasena,
        confirmar_contrasena: form.confirmacion,
        rol: 'refugio',
        nombre: form.nombre || form.nombreRefugio,
        apellido: form.apellido || '-',
      });

      if (!res.success) return;

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      localStorage.setItem('userId', res.data.id_usuario);
      localStorage.setItem('nombre', form.nombre || form.nombreRefugio);
      localStorage.setItem('est_usuario', res.data.est_usuario || 'incompleto');

      const perfilRes = await api.post('/refugios/datos', {
        nom_refug: form.nombreRefugio,
        dir_refug: form.direccion,
        telf_refug: form.telefono,
        licencia_refug: form.licencia,
        descripcion: form.descripcion,
      });

      if (perfilRes.data?.data?.token) {
        localStorage.setItem('token', perfilRes.data.data.token);
      }

      localStorage.setItem('est_usuario', 'pendiente');
      onSuccess?.();
      navigate('/dashboard/refugio');
    } catch (err: unknown) {
      setErrors({ general: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const allMet = pwReqs.length && pwReqs.upper && pwReqs.num && pwReqs.special;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 22,
            fontWeight: 900,
            margin: '0 0 4px',
            color: '#1a1a1a',
            letterSpacing: '-0.4px',
          }}
        >
          Registro refugio
        </h2>
        <p style={{ fontSize: 13, color: '#96c6b5', margin: 0, fontWeight: 500 }}>
          Crea la cuenta y envia los datos del refugio en un solo paso
        </p>
      </div>

      <div
        style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12,
          color: '#0369a1',
        }}
      >
        El administrador verificara tu organizacion antes de activar la cuenta.
      </div>

      {errors.general && (
        <div
          style={{
            background: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {errors.general}
        </div>
      )}

      <div style={field}>
        <label style={label} htmlFor="rr-nombreRefugio">Nombre del refugio</label>
        <input
          id="rr-nombreRefugio"
          name="nombreRefugio"
          type="text"
          autoComplete="organization"
          value={form.nombreRefugio}
          onChange={onChange}
          placeholder="Nombre de tu organizacion"
          style={{ ...input, borderColor: errors.nombreRefugio ? '#e53e3e' : '#e8e8e8' }}
        />
        {errors.nombreRefugio && <span style={errStyle}>{errors.nombreRefugio}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label} htmlFor="rr-nombre">Nombre responsable</label>
          <input
            id="rr-nombre"
            name="nombre"
            type="text"
            autoComplete="given-name"
            value={form.nombre}
            onChange={onChange}
            placeholder="Tu nombre"
            style={input}
          />
        </div>
        <div style={field}>
          <label style={label} htmlFor="rr-apellido">Apellido</label>
          <input
            id="rr-apellido"
            name="apellido"
            type="text"
            autoComplete="family-name"
            value={form.apellido}
            onChange={onChange}
            placeholder="Tu apellido"
            style={input}
          />
        </div>
      </div>

      <div style={field}>
        <label style={label} htmlFor="rr-correo">Correo electronico</label>
        <input
          id="rr-correo"
          name="correo"
          type="email"
          autoComplete="username"
          value={form.correo}
          onChange={onChange}
          placeholder="refugio@correo.com"
          style={{ ...input, borderColor: errors.correo ? '#e53e3e' : '#e8e8e8' }}
        />
        {errors.correo && <span style={errStyle}>{errors.correo}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label} htmlFor="rr-telefono">Telefono</label>
          <input
            id="rr-telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            value={form.telefono}
            onChange={onChange}
            placeholder="+591 7xxxxxxx"
            style={{ ...input, borderColor: errors.telefono ? '#e53e3e' : '#e8e8e8' }}
          />
          {errors.telefono && <span style={errStyle}>{errors.telefono}</span>}
        </div>
        <div style={field}>
          <label style={label} htmlFor="rr-direccion">Direccion / zona</label>
          <input
            id="rr-direccion"
            name="direccion"
            type="text"
            autoComplete="address-line1"
            value={form.direccion}
            onChange={onChange}
            placeholder="Zona Norte, La Paz"
            style={{ ...input, borderColor: errors.direccion ? '#e53e3e' : '#e8e8e8' }}
          />
          {errors.direccion && <span style={errStyle}>{errors.direccion}</span>}
        </div>
      </div>

      <div style={field}>
        <label style={label} htmlFor="rr-licencia">Numero de licencia</label>
        <input
          id="rr-licencia"
          name="licencia"
          type="text"
          autoComplete="off"
          value={form.licencia}
          onChange={onChange}
          placeholder="Licencia o registro oficial"
          style={{ ...input, borderColor: errors.licencia ? '#e53e3e' : '#e8e8e8' }}
        />
        {errors.licencia && <span style={errStyle}>{errors.licencia}</span>}
      </div>

      <div style={field}>
        <label style={label} htmlFor="rr-descripcion">Descripcion opcional</label>
        <input
          id="rr-descripcion"
          name="descripcion"
          type="text"
          autoComplete="off"
          value={form.descripcion}
          onChange={onChange}
          placeholder="Cuentanos brevemente sobre tu refugio"
          style={input}
        />
      </div>

      <div style={field}>
        <label style={label} htmlFor="rr-contrasena">Contrasena</label>
        <input
          id="rr-contrasena"
          name="contrasena"
          type="password"
          autoComplete="new-password"
          value={form.contrasena}
          onChange={onChange}
          placeholder="Minimo 8 caracteres"
          style={{ ...input, borderColor: errors.contrasena ? '#e53e3e' : '#e8e8e8' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
          {[
            { ok: pwReqs.length, txt: '8 caracteres' },
            { ok: pwReqs.upper, txt: 'Mayuscula' },
            { ok: pwReqs.num, txt: 'Numero' },
            { ok: pwReqs.special, txt: 'Especial (!@#...)' },
          ].map((req) => (
            <span
              key={req.txt}
              style={{
                fontSize: 11,
                color: req.ok ? '#4caf50' : '#aaa',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {req.ok ? 'OK' : '-'} {req.txt}
            </span>
          ))}
        </div>
        {errors.contrasena && <span style={errStyle}>{errors.contrasena}</span>}
      </div>

      <div style={field}>
        <label style={label} htmlFor="rr-confirmacion">Confirmacion</label>
        <input
          id="rr-confirmacion"
          name="confirmacion"
          type="password"
          autoComplete="new-password"
          value={form.confirmacion}
          onChange={onChange}
          placeholder="Repite tu contrasena"
          style={{ ...input, borderColor: errors.confirmacion ? '#e53e3e' : '#e8e8e8' }}
        />
        {errors.confirmacion && <span style={errStyle}>{errors.confirmacion}</span>}
      </div>

      <button
        type="submit"
        disabled={loading || !allMet}
        style={{
          width: '100%',
          padding: '13px',
          background: allMet ? '#1a1a1a' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: allMet && !loading ? 'pointer' : 'not-allowed',
          fontFamily: 'DM Sans, sans-serif',
          marginTop: 4,
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Registrando...' : 'Registrar refugio'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: '14px 0 12px' }}>
        Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#96c6b5',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Inicia sesion
        </button>
      </p>
    </form>
  );
}
