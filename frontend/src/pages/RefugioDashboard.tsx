// filepath: src/pages/RefugioDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from './Navbar';
import './RefugioDashboard.css';

export default function RefugioDashboard() {
  const navigate = useNavigate();
  const [estadoRefugio, setEstadoRefugio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [datosRefugio, setDatosRefugio] = useState<any>(null);

  useEffect(() => {
    verificarEstado();
  }, []);

  const verificarEstado = async () => {
    try {
      const estUsuario = localStorage.getItem('est_usuario');
      setEstadoRefugio(estUsuario);
      if (estUsuario === 'activo') {
        const response = await api.get('/refugios/datos');
        if (response.data.success && response.data.data) setDatosRefugio(response.data.data);
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main"><div className="loading">Cargando...</div></div>
      </div>
    );
  }

  if (estadoRefugio === 'pendiente') {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main">
          <div className="rd-card pending">
            <div className="rd-card-icon pending">⏳</div>
            <h2>Solicitud en Espera</h2>
            <p>Tu solicitud de registro como refugio está <strong>pendiente de validación</strong> por un administrador.</p>
            <p className="rd-info">Recibirás una notificación cuando tu perfil sea aprobado.</p>
            {datosRefugio && (
              <div className="rd-datos">
                <h3>Datos enviados</h3>
                <div className="rd-dato-row"><span>Nombre</span><strong>{datosRefugio.nom_refug}</strong></div>
                <div className="rd-dato-row"><span>Dirección</span><strong>{datosRefugio.dir_refug}</strong></div>
                <div className="rd-dato-row"><span>Teléfono</span><strong>{datosRefugio.telf_refug}</strong></div>
              </div>
            )}
            <div className="rd-btn-group">
              <button className="rd-btn secondary" onClick={() => navigate('/')}>🏠 Volver al inicio</button>
              <button className="rd-btn ghost" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (estadoRefugio === 'activo') {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main">
          <div className="rd-welcome">
            <div className="rd-welcome-text">
              <h1>¡Bienvenido, {datosRefugio?.nom_refug || 'Refugio'}! 🏠</h1>
              <p>Tu refugio está aprobado. Gestiona tus mascotas y solicitudes desde aquí.</p>
            </div>
            <div className="rd-welcome-actions">
              <button className="rd-btn secondary sm" onClick={() => navigate('/')}>🏠 Inicio</button>
              <button className="rd-btn ghost sm" onClick={handleLogout}>Salir</button>
            </div>
          </div>

          <div className="rd-approved-badge">
            <span className="rd-approved-icon">✓</span>
            <span>Refugio verificado y aprobado</span>
          </div>

          <div className="rd-grid">
            <div className="rd-option" onClick={() => navigate('/refugio/mascotas')}>
              <div className="rd-option-icon">🐕</div>
              <div className="rd-option-info">
                <h3>Gestionar Mascotas</h3>
                <p>Publicar, editar y eliminar mascotas en adopción</p>
              </div>
              <span className="rd-option-arrow">→</span>
            </div>
            <div className="rd-option" onClick={() => navigate('/refugio/adopciones')}>
              <div className="rd-option-icon">📋</div>
              <div className="rd-option-info">
                <h3>Solicitudes de Adopción</h3>
                <p>Revisa y gestiona solicitudes de tus mascotas</p>
              </div>
              <span className="rd-option-arrow">→</span>
            </div>
            <div className="rd-option" onClick={() => navigate('/completar-perfil/refugio')}>
              <div className="rd-option-icon">👤</div>
              <div className="rd-option-info">
                <h3>Mi Perfil</h3>
                <p>Actualizar información de tu refugio</p>
              </div>
              <span className="rd-option-arrow">→</span>
            </div>
            <div className="rd-option" onClick={() => navigate('/notificaciones')}>
              <div className="rd-option-icon">🔔</div>
              <div className="rd-option-info">
                <h3>Notificaciones</h3>
                <p>Ver mensajes y alertas recientes</p>
              </div>
              <span className="rd-option-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (estadoRefugio === 'rechazado') {
    return (
      <div className="rd-wrapper">
        <Navbar />
        <div className="rd-main">
          <div className="rd-card rejected">
            <div className="rd-card-icon rejected">✗</div>
            <h2>Tu Solicitud fue Rechazada</h2>
            <p>Tu solicitud de registro como refugio fue rechazada.</p>
            <p className="rd-info">Por favor comuníquese con el administrador para más información.</p>
            <div className="rd-btn-group">
              <button className="rd-btn secondary" onClick={() => navigate('/')}>🏠 Volver al inicio</button>
              <button className="rd-btn ghost" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rd-wrapper">
      <Navbar />
      <div className="rd-main">
        <div className="rd-card">
          <h2>Completa tu perfil</h2>
          <p>Debes completar los datos de tu refugio para continuar.</p>
          <div className="rd-btn-group">
            <button className="rd-btn primary" onClick={() => navigate('/completar-perfil/refugio')}>Completar Perfil</button>
            <button className="rd-btn secondary" onClick={() => navigate('/')}>🏠 Volver al inicio</button>
          </div>
        </div>
      </div>
    </div>
  );
}