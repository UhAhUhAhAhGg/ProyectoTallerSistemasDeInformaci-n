import React, { useState } from "react";
import ValidarRefugiosMF from "./ValidarRefugiosMF";
import GestionUsuariosMF from "./GestionUsuariosMF";
import "./AdminDashboard.css";

type Tab = "refugios" | "usuarios";

const AdminDashboard: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<Tab>("refugios");

  const tabs: { id: Tab; label: string; icon: string; descripcion: string }[] = [
    {
      id: "refugios",
      label: "Validar Refugios",
      icon: "🏠",
      descripcion: "HU-03 · Aprobar o rechazar nuevos refugios",
    },
    {
      id: "usuarios",
      label: "Gestión de Usuarios",
      icon: "👥",
      descripcion: "HU-04 · Bloquear o reactivar cuentas",
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-dashboard__sidebar">
        <div className="admin-dashboard__brand">
          <span className="admin-dashboard__brand-icon">🐾</span>
          <div>
            <span className="admin-dashboard__brand-name">AdoptaMe</span>
            <span className="admin-dashboard__brand-role">Panel Admin</span>
          </div>
        </div>

        <nav className="admin-dashboard__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-dashboard__nav-item ${tabActiva === tab.id ? "admin-dashboard__nav-item--active" : ""}`}
              onClick={() => setTabActiva(tab.id)}
            >
              <span className="admin-dashboard__nav-icon">{tab.icon}</span>
              <div className="admin-dashboard__nav-text">
                <span className="admin-dashboard__nav-label">{tab.label}</span>
                <span className="admin-dashboard__nav-desc">{tab.descripcion}</span>
              </div>
            </button>
          ))}
        </nav>

        <button
          className="admin-dashboard__logout"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="admin-dashboard__main">
        {/* Header */}
        <header className="admin-dashboard__header">
          <div>
            <h1 className="admin-dashboard__header-title">
              {tabs.find((t) => t.id === tabActiva)?.icon}{" "}
              {tabs.find((t) => t.id === tabActiva)?.label}
            </h1>
            <p className="admin-dashboard__header-sub">
              {tabs.find((t) => t.id === tabActiva)?.descripcion}
            </p>
          </div>
        </header>

        {/* Microfrontend activo */}
        <section className="admin-dashboard__content">
          {tabActiva === "refugios" && <ValidarRefugiosMF />}
          {tabActiva === "usuarios" && <GestionUsuariosMF />}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;