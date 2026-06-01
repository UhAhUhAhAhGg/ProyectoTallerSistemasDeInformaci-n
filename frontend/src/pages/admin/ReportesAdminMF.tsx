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

interface ResumenAdopciones {
  total_solicitudes: number;
  total_aprobadas: number;
  total_rechazadas: number;
  total_enviadas: number;
  total_en_revision: number;
  total_en_espera: number;
  tasa_adopcion: number;
}

interface PorMes {
  mes: string;
  aprobadas: number;
  rechazadas: number;
  total: number;
}

interface PorEspecie {
  especie: string;
  aprobadas: number;
  total: number;
}

interface TopRefugio {
  nom_refug: string;
  adopciones: number;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ReportesAdminMF: React.FC = () => {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [resumenAdopciones, setResumenAdopciones] = useState<ResumenAdopciones | null>(null);
  const [porMes, setPorMes] = useState<PorMes[]>([]);
  const [porEspecie, setPorEspecie] = useState<PorEspecie[]>([]);
  const [topRefugios, setTopRefugios] = useState<TopRefugio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setMensaje(null);

    try {
      const [refugiosRes, usuariosRes, reporteRes] = await Promise.all([
        fetch(`${API_BASE}/refugios/admin/solicitudes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/admin/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/admin/reporte`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!refugiosRes.ok || !usuariosRes.ok) throw new Error("Error al cargar datos base");

      const refugiosData = await refugiosRes.json();
      const usuariosData = await usuariosRes.json();

      setRefugios(Array.isArray(refugiosData.data) ? refugiosData.data : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : (usuariosData.data ?? []));

      if (reporteRes.ok) {
        const reporteData = await reporteRes.json();
        if (reporteData.data) {
          setResumenAdopciones(reporteData.data.resumen);
          setPorMes(reporteData.data.por_mes ?? []);
          setPorEspecie(reporteData.data.por_especie ?? []);
          setTopRefugios(reporteData.data.top_refugios ?? []);
        }
      }
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
    const adoptantes      = usuarios.filter((u) => u.rol === "adoptante").length;
    const refugiosUsuarios = usuarios.filter((u) => u.rol === "refugio").length;
    const bloqueados      = usuarios.filter((u) => !u.activo).length;
    const pendientes      = refugios.filter((r) => r.est_aprobacion === "pendiente").length;
    const aprobados       = refugios.filter((r) => r.est_aprobacion === "aprobado").length;
    const rechazados      = refugios.filter((r) => r.est_aprobacion === "rechazado").length;
    return { adoptantes, refugiosUsuarios, bloqueados, pendientes, aprobados, rechazados };
  }, [refugios, usuarios]);

  const ultimosUsuarios = useMemo(
    () =>
      [...usuarios]
        .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
        .slice(0, 6),
    [usuarios]
  );

  const exportarPdf = () => {
    const ventana = window.open("", "_blank", "width=900,height=700");
    if (!ventana) return;

    const fecha = new Date().toLocaleString("es-BO");

    const filasUsuarios = ultimosUsuarios
      .map(
        (u) => `<tr>
          <td>${u.nombre} ${u.apellido ?? ""}</td>
          <td>${u.correo}</td>
          <td>${u.rol}</td>
          <td>${u.activo ? "Activo" : "Bloqueado"}</td>
        </tr>`
      )
      .join("");

    const filasMes = porMes
      .map(
        (m) => `<tr>
          <td>${m.mes}</td>
          <td style="color:#16a34a;font-weight:700">${m.aprobadas}</td>
          <td style="color:#dc2626;font-weight:700">${m.rechazadas}</td>
          <td>${m.total}</td>
        </tr>`
      )
      .join("");

    const filasEspecie = porEspecie
      .map(
        (e) => `<tr>
          <td>${e.especie}</td>
          <td style="color:#16a34a;font-weight:700">${e.aprobadas}</td>
          <td>${e.total}</td>
        </tr>`
      )
      .join("");

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte Administrativo - AdoptaMe</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
            h1 { margin: 0 0 4px; font-size: 22px; }
            p.sub { color: #6b7280; margin: 0 0 20px; font-size: 13px; }
            h2 { margin: 20px 0 10px; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .label { color: #6b7280; font-size: 11px; text-transform: uppercase; }
            .value { font-size: 24px; font-weight: 700; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
            th { background: #f9fafb; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Reporte Administrativo - AdoptaMe</h1>
          <p class="sub">Generado: ${fecha}</p>

          <h2>Usuarios y Refugios</h2>
          <div class="grid">
            <div class="card"><div class="label">Adoptantes</div><div class="value">${metricas.adoptantes}</div></div>
            <div class="card"><div class="label">Refugios</div><div class="value">${metricas.refugiosUsuarios}</div></div>
            <div class="card"><div class="label">Bloqueados</div><div class="value">${metricas.bloqueados}</div></div>
            <div class="card"><div class="label">Refugios pendientes</div><div class="value">${metricas.pendientes}</div></div>
            <div class="card"><div class="label">Refugios aprobados</div><div class="value">${metricas.aprobados}</div></div>
            <div class="card"><div class="label">Refugios rechazados</div><div class="value">${metricas.rechazados}</div></div>
          </div>

          ${resumenAdopciones ? `
          <h2>Solicitudes de Adopción</h2>
          <div class="grid">
            <div class="card"><div class="label">Total solicitudes</div><div class="value">${resumenAdopciones.total_solicitudes}</div></div>
            <div class="card"><div class="label">Aprobadas</div><div class="value" style="color:#16a34a">${resumenAdopciones.total_aprobadas}</div></div>
            <div class="card"><div class="label">Rechazadas</div><div class="value" style="color:#dc2626">${resumenAdopciones.total_rechazadas}</div></div>
            <div class="card"><div class="label">Tasa de adopción</div><div class="value" style="color:#4f46e5">${resumenAdopciones.tasa_adopcion}%</div></div>
            <div class="card"><div class="label">En revisión</div><div class="value">${resumenAdopciones.total_en_revision}</div></div>
            <div class="card"><div class="label">En espera</div><div class="value">${resumenAdopciones.total_en_espera}</div></div>
          </div>
          ` : ""}

          ${filasMes ? `
          <h2>Adopciones por mes (últimos 6 meses)</h2>
          <table>
            <thead><tr><th>Mes</th><th>Aprobadas</th><th>Rechazadas</th><th>Total</th></tr></thead>
            <tbody>${filasMes || "<tr><td colspan='4'>Sin datos</td></tr>"}</tbody>
          </table>
          ` : ""}

          ${filasEspecie ? `
          <h2>Adopciones por especie</h2>
          <table>
            <thead><tr><th>Especie</th><th>Aprobadas</th><th>Total</th></tr></thead>
            <tbody>${filasEspecie || "<tr><td colspan='3'>Sin datos</td></tr>"}</tbody>
          </table>
          ` : ""}

          <h2>Últimos usuarios registrados</h2>
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead>
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

      {/* Métricas de usuarios y refugios */}
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
        Usuarios y Refugios
      </h3>
      <div className="admin-reportes__grid" style={{ marginBottom: 28 }}>
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

      {/* HU-28: Métricas de adopciones */}
      {resumenAdopciones && (
        <>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Solicitudes de Adopción
          </h3>
          <div className="admin-reportes__grid" style={{ marginBottom: 28 }}>
            <article className="admin-reportes__metric">
              <span>Total solicitudes</span>
              <strong>{resumenAdopciones.total_solicitudes}</strong>
            </article>
            <article className="admin-reportes__metric admin-reportes__metric--success">
              <span>Aprobadas</span>
              <strong>{resumenAdopciones.total_aprobadas}</strong>
            </article>
            <article className="admin-reportes__metric admin-reportes__metric--danger">
              <span>Rechazadas</span>
              <strong>{resumenAdopciones.total_rechazadas}</strong>
            </article>
            <article className="admin-reportes__metric">
              <span>Tasa de adopción</span>
              <strong style={{ color: "#4f46e5" }}>{resumenAdopciones.tasa_adopcion}%</strong>
            </article>
            <article className="admin-reportes__metric admin-reportes__metric--warning">
              <span>En revisión</span>
              <strong>{resumenAdopciones.total_en_revision}</strong>
            </article>
            <article className="admin-reportes__metric">
              <span>En espera</span>
              <strong>{resumenAdopciones.total_en_espera}</strong>
            </article>
          </div>
        </>
      )}

      {/* Por mes */}
      {porMes.length > 0 && (
        <div className="admin-reportes__table-wrap" style={{ marginBottom: 24 }}>
          <h3>Adopciones por mes (últimos 6 meses)</h3>
          <table className="admin-reportes__table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Aprobadas</th>
                <th>Rechazadas</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {porMes.map((m) => (
                <tr key={m.mes}>
                  <td>{m.mes}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>{m.aprobadas}</td>
                  <td style={{ color: "#dc2626", fontWeight: 600 }}>{m.rechazadas}</td>
                  <td>{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Por especie */}
      {porEspecie.length > 0 && (
        <div className="admin-reportes__table-wrap" style={{ marginBottom: 24 }}>
          <h3>Adopciones por especie</h3>
          <table className="admin-reportes__table">
            <thead>
              <tr>
                <th>Especie</th>
                <th>Aprobadas</th>
                <th>Total solicitudes</th>
              </tr>
            </thead>
            <tbody>
              {porEspecie.map((e) => (
                <tr key={e.especie}>
                  <td>{e.especie}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>{e.aprobadas}</td>
                  <td>{e.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top refugios */}
      {topRefugios.length > 0 && (
        <div className="admin-reportes__table-wrap" style={{ marginBottom: 24 }}>
          <h3>Top 5 refugios con más adopciones</h3>
          <table className="admin-reportes__table">
            <thead>
              <tr>
                <th>Refugio</th>
                <th>Adopciones aprobadas</th>
              </tr>
            </thead>
            <tbody>
              {topRefugios.map((r) => (
                <tr key={r.nom_refug}>
                  <td>{r.nom_refug}</td>
                  <td style={{ fontWeight: 700, color: "#4f46e5" }}>{r.adopciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Últimos usuarios */}
      <div className="admin-reportes__table-wrap">
        <h3>Últimos usuarios registrados</h3>
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
            {ultimosUsuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.nombre} {u.apellido ?? ""}
                </td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? "Activo" : "Bloqueado"}</td>
                <td>
                  {u.fechaRegistro
                    ? new Date(u.fechaRegistro).toLocaleDateString("es-BO")
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