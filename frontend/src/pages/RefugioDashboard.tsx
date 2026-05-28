// filepath: frontend/src/pages/RefugioDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { refugioService } from '../services/api';
import './RefugioDashboard.css';
import MetricasRefugioPanel from '../components/metricas/MetricasRefugioPanel';

const ADMIN_EMAIL = 'admin@petmatch.com';

export default function RefugioDashboard() {
  const navigate = useNavigate();
  const [nombre, setNombre]             = useState<string | null>(null);
  const [estUsuario, setEstUsuario]     = useState<string | null>(null);
  const [datosRefugio, setDatosRefugio] = useState<any>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol   = localStorage.getItem('rol');
    if (!token || rol !== 'refugio') {
      navigate('/login');
      return;
    }

    setNombre(localStorage.getItem('nombre'));
    const estLocal = localStorage.getItem('est_usuario');
    setEstUsuario(estLocal);

    refugioService.obtenerDatos()
      .then((res) => {
        if (res?.success && res.data) {
          setDatosRefugio(res.data);
          if (res.data.est_aprobacion === 'aprobado' && estLocal !== 'activo') {
            localStorage.setItem('est_usuario', 'activo');
            setEstUsuario('activo');
          }
        }
      })
      .catch(() => { /* sin datos aún */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main"><div className="loading">Cargando...</div></div>
      </div>
    );
  }

  // Sin datos cargados todavía → completar perfil
  if (!datosRefugio || estUsuario === 'incompleto') {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main">
          <div className="rd-card pending">
            <div className="rd-card-icon pending">!</div>
            <h2>Completa los datos de tu refugio</h2>
            <p>Antes de continuar necesitamos que registres los datos de tu organización.</p>
            <div className="rd-btn-group">
              <button className="rd-btn primary" onClick={() => navigate('/completar-perfil/refugio')}>
                Completar perfil →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pendiente de aprobación
  if (estUsuario === 'pendiente' || datosRefugio.est_aprobacion === 'pendiente') {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main">
          <div className="rd-card pending">
            <div className="rd-card-icon pending">⏳</div>
            <h2>Solicitud en revisión</h2>
            <p>Tu refugio <strong>{datosRefugio.nom_refug}</strong> está esperando ser aprobado por un administrador.</p>
            <p className="rd-info">Recibirás una notificación cuando tu cuenta sea validada.</p>

            <div className="rd-datos">
              <h3>Datos enviados</h3>
              <div className="rd-dato-row"><span>Nombre</span><strong>{datosRefugio.nom_refug}</strong></div>
              <div className="rd-dato-row"><span>Dirección</span><strong>{datosRefugio.dir_refug}</strong></div>
              <div className="rd-dato-row"><span>Teléfono</span><strong>{datosRefugio.telf_refug}</strong></div>
              <div className="rd-dato-row"><span>Licencia</span><strong>{datosRefugio.licencia_refug}</strong></div>
            </div>

            <div className="rd-btn-group">
              <button className="rd-btn secondary" onClick={() => navigate('/completar-perfil/refugio')}>
                ✏️ Editar datos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rechazado
  if (estUsuario === 'rechazado' || datosRefugio.est_aprobacion === 'rechazado') {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main">
          <div className="rd-card rejected">
            <div className="rd-card-icon rejected">✗</div>
            <h2>Solicitud rechazada</h2>
            <p>El administrador no aprobó tu solicitud de registro como refugio.</p>
            <p className="rd-info">Si crees que es un error, comunícate al correo: <strong>{ADMIN_EMAIL}</strong></p>
          </div>
        </div>
      </div>
    );
  }

  // Aprobado: dashboard normal
  return (
    <div className="rd-wrapper">
      <Navbar />
      <div className="rd-main">
        <div className="rd-welcome">
          <div>
            <h1>¡Hola, {datosRefugio.nom_refug || nombre || 'Refugio'}! 🏠</h1>
            <p>Gestiona tus mascotas y solicitudes de adopción desde aquí.</p>
          </div>
        </div>

        <div className="rd-approved-badge">
          <span className="rd-approved-icon">✓</span> Refugio aprobado
        </div>

        <div style={{ margin: '1rem 0' }}>
          <MetricasRefugioPanel idRefug={datosRefugio.id_refug} />
        </div>

        <div className="rd-grid">
          <div className="rd-option" onClick={() => navigate('/refugio/mascotas')}>
            <div className="rd-option-icon">🐾</div>
            <div className="rd-option-info">
              <h3>Mis Mascotas</h3>
              <p>Registrar, editar o dar de baja mascotas en adopción</p>
            </div>
            <span className="rd-option-arrow">→</span>
          </div>

          <div className="rd-option" onClick={() => navigate('/refugio/adopciones')}>
            <div className="rd-option-icon">📋</div>
            <div className="rd-option-info">
              <h3>Solicitudes recibidas</h3>
              <p>Aprobar o rechazar solicitudes de adopción</p>
            </div>
            <span className="rd-option-arrow">→</span>
          </div>

          <div className="rd-option" onClick={() => navigate('/completar-perfil/refugio')}>
            <div className="rd-option-icon">⚙️</div>
            <div className="rd-option-info">
              <h3>Datos del refugio</h3>
              <p>Editar información de la organización</p>
            </div>
            <span className="rd-option-arrow">→</span>
          </div>

          <div className="rd-option" onClick={() => navigate('/notificaciones')}>
            <div className="rd-option-icon">🔔</div>
            <div className="rd-option-info">
              <h3>Notificaciones</h3>
              <p>Mensajes y alertas recientes</p>
            </div>
            <span className="rd-option-arrow">→</span>
          </div>

          <div className="rd-option" onClick={() => navigate('/mensajeria')}>
            <div className="rd-option-icon">💬</div>
            <div className="rd-option-info">
              <h3>Mensajes</h3>
              <p>Responde consultas de los adoptantes interesados</p>
            </div>
            <span className="rd-option-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}