import React, { useCallback, useEffect, useMemo, useState } from "react";

interface Refugio {
  id_refug: number;
  nom_refug: string;
  corr_usuario: string;
  est_aprobacion: "pendiente" | "aprobado" | "rechazado";
  fecha_solicitud: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  correo: string;
  rol: "adoptante" | "refugio" | "administrador";
  activo: boolean;
  fechaRegistro: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ReportesAdminMF: React.FC = () => {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setMensaje(null);

    try {
      const [refugiosRes, usuariosRes] = await Promise.all([
        fetch(`${API_BASE}/refugios/admin/solicitudes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/admin/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!refugiosRes.ok || !usuariosRes.ok) throw new Error();

      const refugiosData = await refugiosRes.json();
      const usuariosData = await usuariosRes.json();

      setRefugios(Array.isArray(refugiosData.data) ? refugiosData.data : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : usuariosData.data ?? []);
    } catch {
      setMensaje("No se pudieron cargar los datos del reporte.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const metricas = useMemo(() => {
    const adoptantes = usuarios.filter((usuario) => usuario.rol === "adoptante").length;
    const refugiosUsuarios = usuarios.filter((usuario) => usuario.rol === "refugio").length;
    const bloqueados = usuarios.filter((usuario) => !usuario.activo).length;
    const pendientes = refugios.filter((refugio) => refugio.est_aprobacion === "pendiente").length;
    const aprobados = refugios.filter((refugio) => refugio.est_aprobacion === "aprobado").length;
    const rechazados = refugios.filter((refugio) => refugio.est_aprobacion === "rechazado").length;

    return { adoptantes, refugiosUsuarios, bloqueados, pendientes, aprobados, rechazados };
  }, [refugios, usuarios]);

  const ultimosUsuarios = useMemo(
    () =>
      [...usuarios]
        .sort(
          (a, b) =>
            new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        )
        .slice(0, 6),
    [usuarios]
  );

  const exportarPdf = () => {
    const ventana = window.open("", "_blank", "width=900,height=700");
    if (!ventana) return;

    const fecha = new Date().toLocaleString("es-BO");
    const filasUsuarios = ultimosUsuarios
      .map(
        (usuario) => `
          <tr>
            <td>${usuario.nombre} ${usuario.apellido ?? ""}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.rol}</td>
            <td>${usuario.activo ? "Activo" : "Bloqueado"}</td>
          </tr>`
      )
      .join("");

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte administrativo - AdoptaMe</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
            h1 { margin: 0 0 8px; font-size: 24px; }
            p { color: #6b7280; margin: 0 0 24px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 28px; font-weight: 700; margin-top: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Reporte administrativo - AdoptaMe</h1>
          <p>Generado: ${fecha}</p>
          <div class="grid">
            <div class="card"><div class="label">Adoptantes</div><div class="value">${metricas.adoptantes}</div></div>
            <div class="card"><div class="label">Refugios registrados</div><div class="value">${metricas.refugiosUsuarios}</div></div>
            <div class="card"><div class="label">Usuarios bloqueados</div><div class="value">${metricas.bloqueados}</div></div>
            <div class="card"><div class="label">Refugios pendientes</div><div class="value">${metricas.pendientes}</div></div>
            <div class="card"><div class="label">Refugios aprobados</div><div class="value">${metricas.aprobados}</div></div>
            <div class="card"><div class="label">Refugios rechazados</div><div class="value">${metricas.rechazados}</div></div>
          </div>
          <h2>Ultimos usuarios registrados</h2>
          <table>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr>
            </thead>
            <tbody>${filasUsuarios || "<tr><td colspan='4'>Sin usuarios registrados</td></tr>"}</tbody>
          </table>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  if (loading) {
    return <div className="admin-reportes__empty">Cargando reportes...</div>;
  }

  return (
    <div className="admin-reportes">
      <div className="admin-reportes__header">
        <div>
          <h2>Reportes</h2>
          <p>Vista consolidada para seguimiento administrativo.</p>
        </div>
        <div className="admin-reportes__actions">
          <button onClick={cargarDatos} type="button">
            Actualizar
          </button>
          <button className="admin-reportes__primary" onClick={exportarPdf} type="button">
            Descargar PDF
          </button>
        </div>
      </div>

      {mensaje && <div className="admin-reportes__message">{mensaje}</div>}

      <div className="admin-reportes__grid">
        <article className="admin-reportes__metric">
          <span>Adoptantes</span>
          <strong>{metricas.adoptantes}</strong>
        </article>
        <article className="admin-reportes__metric">
          <span>Refugios registrados</span>
          <strong>{metricas.refugiosUsuarios}</strong>
        </article>
        <article className="admin-reportes__metric">
          <span>Usuarios bloqueados</span>
          <strong>{metricas.bloqueados}</strong>
        </article>
        <article className="admin-reportes__metric admin-reportes__metric--warning">
          <span>Refugios pendientes</span>
          <strong>{metricas.pendientes}</strong>
        </article>
        <article className="admin-reportes__metric admin-reportes__metric--success">
          <span>Refugios aprobados</span>
          <strong>{metricas.aprobados}</strong>
        </article>
        <article className="admin-reportes__metric admin-reportes__metric--danger">
          <span>Refugios rechazados</span>
          <strong>{metricas.rechazados}</strong>
        </article>
      </div>

      <div className="admin-reportes__table-wrap">
        <h3>Ultimos usuarios registrados</h3>
        <table className="admin-reportes__table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ultimosUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  {usuario.nombre} {usuario.apellido ?? ""}
                </td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.activo ? "Activo" : "Bloqueado"}</td>
                <td>
                  {usuario.fechaRegistro
                    ? new Date(usuario.fechaRegistro).toLocaleDateString("es-BO")
                    : "-"}
                </td>
              </tr>
            ))}
            {ultimosUsuarios.length === 0 && (
              <tr>
                <td colSpan={5}>Sin usuarios registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesAdminMF;
