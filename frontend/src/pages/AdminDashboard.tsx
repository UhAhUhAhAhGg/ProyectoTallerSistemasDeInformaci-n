// filepath: src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from './Navbar';
import './AdminDashboard.css';

interface Refugio {
  id_refug: number;
  nom_refug: string;
  dir_refug: string;
  telf_refug: string;
  corr_refug: string;
  licencia_refug: string;
  est_verif_refug: string;
  nom_usuario: string;
  appell_usuario: string;
  corr_usuario: string;
  fenac_usuario: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefugio, setSelectedRefugio] = useState<Refugio | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const verificarRol = () => {
      const rol = localStorage.getItem('rol');
      if (rol !== 'administrador') navigate('/login');
    };
    verificarRol();
    cargarSolicitudes();
  }, [navigate]);

  const cargarSolicitudes = async () => {
    try {
      const response = await api.get('/refugios/admin/solicitudes');
      if (response.data.success) setRefugios(response.data.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id_refug: number) => {
    setActionLoading(true);
    try {
      await api.patch(`/refugios/admin/refugio/${id_refug}/estado`, { estado: 'aprobado' });
      cargarSolicitudes();
      setSelectedRefugio(null);
    } catch (error) {
      console.error('Error al aprobar:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (id_refug: number) => {
    setActionLoading(true);
    try {
      await api.patch(`/refugios/admin/refugio/${id_refug}/estado`, { estado: 'rechazado' });
      cargarSolicitudes();
      setSelectedRefugio(null);
    } catch (error) {
      console.error('Error al rechazar:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-container">
      <Navbar />

      <div className="admin-subheader">
        <div>
          <h1>⚙️ Panel de Administrador</h1>
          <p>Gestiona las solicitudes de refugios pendientes</p>
        </div>
        <div className="admin-subheader-actions">
          <button className="admin-btn secondary sm" onClick={() => navigate('/')}>🏠 Inicio</button>
          <button className="admin-btn danger sm" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>

      <main className="admin-main">
        <div className="admin-section-header">
          <h2>📋 Solicitudes Pendientes</h2>
          <span className="admin-badge">{refugios.length} pendiente{refugios.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="loading">Cargando solicitudes...</div>
        ) : refugios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>Todo al día</h3>
            <p>No hay solicitudes pendientes en este momento.</p>
          </div>
        ) : (
          <div className="refugios-grid">
            {refugios.map((refugio) => (
              <div key={refugio.id_refug} className="refugio-card" onClick={() => setSelectedRefugio(refugio)}>
                <div className="refugio-card-icon">🏠</div>
                <div className="refugio-card-info">
                  <h3>{refugio.nom_refug}</h3>
                  <p className="refugio-email">{refugio.corr_usuario}</p>
                  <p className="refugio-licencia">Lic: {refugio.licencia_refug}</p>
                </div>
                <span className="status-badge pendiente">Pendiente</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedRefugio && (
        <div className="modal-overlay" onClick={() => setSelectedRefugio(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Refugio</h2>
              <button className="modal-close" onClick={() => setSelectedRefugio(null)}>✕</button>
            </div>

            <div className="detalle-grid">
              <div className="detalle-item"><label>Nombre</label><span>{selectedRefugio.nom_refug}</span></div>
              <div className="detalle-item"><label>Dirección</label><span>{selectedRefugio.dir_refug}</span></div>
              <div className="detalle-item"><label>Teléfono</label><span>{selectedRefugio.telf_refug}</span></div>
              <div className="detalle-item"><label>Licencia</label><span>{selectedRefugio.licencia_refug}</span></div>
              <div className="detalle-item"><label>Responsable</label><span>{selectedRefugio.nom_usuario} {selectedRefugio.appell_usuario}</span></div>
              <div className="detalle-item"><label>Correo responsable</label><span>{selectedRefugio.corr_usuario}</span></div>
            </div>

            <div className="modal-actions">
              <button className="approve-button" onClick={() => handleAprobar(selectedRefugio.id_refug)} disabled={actionLoading}>
                ✓ Aprobar
              </button>
              <button className="reject-button" onClick={() => handleRechazar(selectedRefugio.id_refug)} disabled={actionLoading}>
                ✗ Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}