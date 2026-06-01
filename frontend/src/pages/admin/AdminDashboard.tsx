import React, { useCallback, useEffect, useMemo, useState } from "react";
import GestionUsuariosMF from "./GestionUsuariosMF";
import ReportesAdminMF from "./ReportesAdminMF";
import ValidarRefugiosMF from "./ValidarRefugiosMF";
import ConfigMatchingMF from './ConfigMatchingMF';
import AnimalesAdminMF from './AnimalesAdminMF';
import "./AdminDashboard.css";

type Tab =
  | "panel"
  | "refugios"
  | "animales"
  | "perfiles"
  | "solicitudes"
  | "matching"
  | "reportes"
  | "mensajeria";

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

const AdminPlaceholder = ({
  titulo,
  descripcion,
  detalles,
}: {
  titulo: string;
  descripcion: string;
  detalles: string[];
}) => (
  <div className="admin-placeholder">
    <div className="admin-placeholder__head">
      <span className="admin-placeholder__icon">+</span>
      <div>
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
      </div>
    </div>
    <div className="admin-placeholder__grid">
      {detalles.map((detalle) => (
        <div className="admin-placeholder__item" key={detalle}>
          {detalle}
        </div>
      ))}
    </div>
  </div>
);

const PanelGeneral = ({ notificaciones }: { notificaciones: Notificacion[] }) => {
  const refugiosPendientes = notificaciones.filter((n) => n.tipo_notif.includes("refugio")).length;
  const registros = notificaciones.filter((n) => n.tipo_notif.includes("registro")).length;

  return (
    <div className="admin-overview">
      <div className="admin-overview__grid">
        <article>
          <span>Refugios por revisar</span>
          <strong>{refugiosPendientes}</strong>
          <small>Solicitudes y avisos recientes</small>
        </article>
        <article>
          <span>Nuevos registros</span>
          <strong>{registros}</strong>
          <small>Actividad recibida por el panel</small>
        </article>
        <article>
          <span>Notificaciones</span>
          <strong>{notificaciones.length}</strong>
          <small>Total visible para administracion</small>
        </article>
      </div>

      <section className="admin-overview__activity">
        <h2>Actividad reciente</h2>
        {notificaciones.length === 0 ? (
          <p>Sin actividad reciente.</p>
        ) : (
          notificaciones.slice(0, 5).map((notificacion) => (
            <div className="admin-overview__event" key={notificacion.id_notif}>
              <div>
                <strong>{notificacion.titulo_notif}</strong>
                <span>{notificacion.cuerpo_notif}</span>
              </div>
              <time>{new Date(notificacion.fech_notif).toLocaleDateString("es-BO")}</time>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<Tab>("panel");
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const token = localStorage.getItem("token");

  const tabs: { id: Tab; label: string; icon: string; descripcion: string }[] = useMemo(
    () => [
      {
        id: "panel",
        label: "Panel General",
        icon: "PG",
        descripcion: "Resumen de actividad y validaciones recientes",
      },
      {
        id: "refugios",
        label: "Refugios",
        icon: "RF",
        descripcion: "Validacion y estado de refugios",
      },
      {
        id: "animales",
        label: "Animales",
        icon: "AN",
        descripcion: "Inventario y publicaciones de mascotas",
      },
      {
        id: "perfiles",
        label: "Perfiles",
        icon: "PF",
        descripcion: "Perfiles de adoptantes, refugios y estado de cuenta",
      },
      {
        id: "solicitudes",
        label: "Solicitudes",
        icon: "SO",
        descripcion: "Seguimiento de solicitudes de adopcion",
      },
      {
        id: "matching",
        label: "Config. Matching",
        icon: "IA",
        descripcion: "Parametros del motor de compatibilidad",
      },
      {
        id: "reportes",
        label: "Reportes",
        icon: "R",
        descripcion: "Resumen general y descarga en PDF",
      },
      {
        id: "mensajeria",
        label: "Mensajeria",
        icon: "MS",
        descripcion: "Comunicaciones y avisos del sistema",
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
                            if (notificacion.tipo_notif.includes("adoptante")) setTabActiva("perfiles");
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
          {tabActiva === "panel" && <PanelGeneral notificaciones={notificaciones} />}
          {tabActiva === "refugios" && <ValidarRefugiosMF />}
          {tabActiva === "animales" && <AnimalesAdminMF />}
          {tabActiva === "perfiles" && <GestionUsuariosMF />}
          {tabActiva === "solicitudes" && (
            <AdminPlaceholder
              titulo="Solicitudes"
              descripcion="Vista administrativa para auditar solicitudes de adopcion y sus estados."
              detalles={["Solicitudes pendientes", "Aprobadas y rechazadas", "Historial por adoptante"]}
            />
          )}
          {tabActiva === "matching" && <ConfigMatchingMF />}
          {tabActiva === "reportes" && <ReportesAdminMF />}
          {tabActiva === "mensajeria" && (
            <AdminPlaceholder
              titulo="Mensajeria"
              descripcion="Bandeja preparada para comunicaciones entre administracion, refugios y adoptantes."
              detalles={["Avisos a refugios", "Alertas a adoptantes", "Mensajes del sistema"]}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
