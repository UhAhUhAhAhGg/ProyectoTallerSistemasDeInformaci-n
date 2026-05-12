import React, { useCallback, useEffect, useMemo, useState } from "react";
import GestionUsuariosMF from "./GestionUsuariosMF";
import ReportesAdminMF from "./ReportesAdminMF";
import ValidarRefugiosMF from "./ValidarRefugiosMF";
import "./AdminDashboard.css";

type Tab = "refugios" | "usuarios" | "reportes";

interface Notificacion {
  id_notif: number;
  tipo_notif: string;
  titulo_notif: string;
  cuerpo_notif: string;
  leida: boolean;
  fech_notif: string;
  ref_id?: number | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const AdminDashboard: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<Tab>("refugios");
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const token = localStorage.getItem("token");

  const tabs: { id: Tab; label: string; icon: string; descripcion: string }[] = useMemo(
    () => [
      {
        id: "refugios",
        label: "Validar Refugios",
        icon: "H",
        descripcion: "HU-03 - Aprobar o rechazar nuevos refugios",
      },
      {
        id: "usuarios",
        label: "Gestion de Usuarios",
        icon: "U",
        descripcion: "HU-04 - Bloquear o reactivar cuentas",
      },
      {
        id: "reportes",
        label: "Reportes",
        icon: "R",
        descripcion: "Resumen general y descarga en PDF",
      },
    ],
    []
  );

  const tabActual = tabs.find((tab) => tab.id === tabActiva) ?? tabs[0];
  const noLeidas = notificaciones.filter((notificacion) => !notificacion.leida).length;

  const cargarNotificaciones = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las notificaciones");
      const data = await res.json();
      setNotificaciones(Array.isArray(data.data) ? data.data : []);
    } catch {
      setNotificaciones([]);
    }
  }, [token]);

  useEffect(() => {
    cargarNotificaciones();
    const intervalId = window.setInterval(cargarNotificaciones, 30000);
    return () => window.clearInterval(intervalId);
  }, [cargarNotificaciones]);

  const marcarTodasLeidas = async () => {
    if (!token || noLeidas === 0) return;

    try {
      const res = await fetch(`${API_BASE}/notificaciones/leer-todas`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudieron marcar");
      setNotificaciones((prev) =>
        prev.map((notificacion) => ({ ...notificacion, leida: true }))
      );
    } catch {
      await cargarNotificaciones();
    }
  };

  const abrirNotificaciones = () => {
    setNotificacionesAbiertas((abiertas) => !abiertas);
    if (!notificacionesAbiertas) void marcarTodasLeidas();
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-dashboard__sidebar">
        <div className="admin-dashboard__brand">
          <span className="admin-dashboard__brand-icon">AM</span>
          <div>
            <span className="admin-dashboard__brand-name">AdoptaMe</span>
            <span className="admin-dashboard__brand-role">Panel Admin</span>
          </div>
        </div>

        <nav className="admin-dashboard__nav" aria-label="Panel de administrador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-dashboard__nav-item ${
                tabActiva === tab.id ? "admin-dashboard__nav-item--active" : ""
              }`}
              onClick={() => setTabActiva(tab.id)}
              type="button"
            >
              <span className="admin-dashboard__nav-icon">{tab.icon}</span>
              <div className="admin-dashboard__nav-text">
                <span className="admin-dashboard__nav-label">{tab.label}</span>
                <span className="admin-dashboard__nav-desc">{tab.descripcion}</span>
              </div>
            </button>
          ))}
        </nav>

        <button className="admin-dashboard__logout" onClick={cerrarSesion} type="button">
          <span aria-hidden="true">X</span> Cerrar sesion
        </button>
      </aside>

      <main className="admin-dashboard__main">
        <header className="admin-dashboard__header">
          <div>
            <h1 className="admin-dashboard__header-title">
              <span className="admin-dashboard__header-icon">{tabActual.icon}</span>
              {tabActual.label}
            </h1>
            <p className="admin-dashboard__header-sub">{tabActual.descripcion}</p>
          </div>

          <div className="admin-dashboard__header-actions">
            <button
              className="admin-dashboard__refresh"
              onClick={cargarNotificaciones}
              type="button"
              title="Actualizar notificaciones"
            >
              Actualizar
            </button>
            <div className="admin-dashboard__notifications">
              <button
                className="admin-dashboard__bell"
                onClick={abrirNotificaciones}
                type="button"
                aria-label={`Notificaciones: ${noLeidas} sin leer`}
              >
                <span className="admin-dashboard__bell-icon">!</span>
                {noLeidas > 0 && <span className="admin-dashboard__bell-badge">{noLeidas}</span>}
              </button>

              {notificacionesAbiertas && (
                <div className="admin-dashboard__notification-panel">
                  <div className="admin-dashboard__notification-head">
                    <strong>Notificaciones</strong>
                    <span>{notificaciones.length} total</span>
                  </div>
                  {notificaciones.length === 0 ? (
                    <p className="admin-dashboard__empty">Sin notificaciones nuevas.</p>
                  ) : (
                    <div className="admin-dashboard__notification-list">
                      {notificaciones.slice(0, 6).map((notificacion) => (
                        <button
                          key={notificacion.id_notif}
                          className="admin-dashboard__notification-item"
                          onClick={() => {
                            if (notificacion.tipo_notif.includes("refugio")) setTabActiva("refugios");
                            if (notificacion.tipo_notif.includes("adoptante")) setTabActiva("usuarios");
                            setNotificacionesAbiertas(false);
                          }}
                          type="button"
                        >
                          <span>{notificacion.titulo_notif}</span>
                          <small>{notificacion.cuerpo_notif}</small>
                          <time>
                            {new Date(notificacion.fech_notif).toLocaleString("es-BO", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </time>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="admin-dashboard__content">
          {tabActiva === "refugios" && <ValidarRefugiosMF />}
          {tabActiva === "usuarios" && <GestionUsuariosMF />}
          {tabActiva === "reportes" && <ReportesAdminMF />}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
