import React, { useCallback, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";

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
  const [refugios, setRefugios]                   = useState<Refugio[]>([]);
  const [usuarios, setUsuarios]                   = useState<Usuario[]>([]);
  const [resumenAdopciones, setResumenAdopciones] = useState<ResumenAdopciones | null>(null);
  const [porMes, setPorMes]                       = useState<PorMes[]>([]);
  const [porEspecie, setPorEspecie]               = useState<PorEspecie[]>([]);
  const [topRefugios, setTopRefugios]             = useState<TopRefugio[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [mensaje, setMensaje]                     = useState<string | null>(null);
  const [preview, setPreview]                     = useState(false);

  const token = localStorage.getItem("token");

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setMensaje(null);
    try {
      const [refugiosRes, usuariosRes, reporteRes] = await Promise.all([
        fetch(`${API_BASE}/refugios/admin/solicitudes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/usuarios`,              { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/reporte`,               { headers: { Authorization: `Bearer ${token}` } }),
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

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const metricas = useMemo(() => {
    const adoptantes       = usuarios.filter((u) => u.rol === "adoptante").length;
    const refugiosUsuarios = usuarios.filter((u) => u.rol === "refugio").length;
    const bloqueados       = usuarios.filter((u) => !u.activo).length;
    const pendientes       = refugios.filter((r) => r.est_aprobacion === "pendiente").length;
    const aprobados        = refugios.filter((r) => r.est_aprobacion === "aprobado").length;
    const rechazados       = refugios.filter((r) => r.est_aprobacion === "rechazado").length;
    return { adoptantes, refugiosUsuarios, bloqueados, pendientes, aprobados, rechazados };
  }, [refugios, usuarios]);

  const ultimosUsuarios = useMemo(
    () =>
      [...usuarios]
        .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
        .slice(0, 6),
    [usuarios]
  );

  // ─── jsPDF generator ────────────────────────────────────────────────────────
  const generarPdf = () => {
    const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW    = doc.internal.pageSize.getWidth();
    const M     = 18;
    const CW    = PW - M * 2;
    let y       = 18;

    const checkPage = (need = 15) => {
      if (y + need > 275) { doc.addPage(); y = 18; }
    };

    const sectionTitle = (text: string) => {
      checkPage(14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(102, 112, 133);
      doc.text(text.toUpperCase(), M, y);
      y += 3.5;
      doc.setDrawColor(229, 231, 235);
      doc.line(M, y, M + CW, y);
      y += 5;
    };

    const metricGrid = (
      items: { label: string; value: string; r?: number; g?: number; b?: number }[]
    ) => {
      const cols  = 3;
      const cellW = CW / cols;
      const cellH = 18;
      const rows  = Math.ceil(items.length / cols);
      checkPage(rows * (cellH + 3) + 6);

      items.forEach((m, i) => {
        const col  = i % cols;
        const row  = Math.floor(i / cols);
        const x    = M + col * cellW;
        const cy   = y + row * (cellH + 3);

        doc.setFillColor(250, 251, 252);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(x, cy, cellW - 2, cellH, 1.5, 1.5, "FD");

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(102, 112, 133);
        doc.text(m.label.toUpperCase(), x + 3.5, cy + 6);

        doc.setFontSize(14);
        if (m.r !== undefined) {
          doc.setTextColor(m.r, m.g!, m.b!);
        } else {
          doc.setTextColor(17, 24, 39);
        }
        doc.text(m.value, x + 3.5, cy + 14);
      });

      y += rows * (cellH + 3) + 6;
    };

    const dataTable = (
      headers: string[],
      rows: string[][],
      colColors?: Record<number, [number, number, number]>
    ) => {
      if (rows.length === 0) return;
      const colW = CW / headers.length;

      checkPage(10);
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.rect(M, y, CW, 7, "FD");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(102, 112, 133);
      headers.forEach((h, i) => doc.text(h.toUpperCase(), M + i * colW + 3, y + 5));
      y += 7;

      rows.forEach((row, ri) => {
        checkPage(7);
        doc.setFillColor(ri % 2 === 0 ? 255 : 249, ri % 2 === 0 ? 255 : 250, ri % 2 === 0 ? 255 : 251);
        doc.setDrawColor(237, 240, 244);
        doc.rect(M, y, CW, 6.5, "FD");
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        row.forEach((cell, ci) => {
          if (colColors && colColors[ci]) {
            const [r, g, b] = colColors[ci];
            doc.setTextColor(r, g, b);
          } else {
            doc.setTextColor(55, 65, 81);
          }
          const maxW     = colW - 6;
          const cellText = doc.getTextWidth(cell) > maxW
            ? cell.slice(0, Math.floor(cell.length * maxW / (doc.getTextWidth(cell) || 1))) + "…"
            : cell;
          doc.text(cellText, M + ci * colW + 3, y + 4.8);
        });
        y += 6.5;
      });
      y += 6;
    };

    // ── Encabezado ──
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, PW, 28, "F");
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 250, 251);
    doc.text("Reporte Administrativo — AdoptaMe", M, 13);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(`Generado: ${new Date().toLocaleString("es-BO")}`, M, 21);
    y = 38;

    // ── Sección 1: Usuarios y Refugios ──
    sectionTitle("Usuarios y Refugios");
    metricGrid([
      { label: "Adoptantes",           value: String(metricas.adoptantes) },
      { label: "Refugios registrados", value: String(metricas.refugiosUsuarios) },
      { label: "Usuarios bloqueados",  value: String(metricas.bloqueados) },
      { label: "Refugios pendientes",  value: String(metricas.pendientes), r: 180, g: 130, b: 0 },
      { label: "Refugios aprobados",   value: String(metricas.aprobados),  r: 22,  g: 163, b: 74 },
      { label: "Refugios rechazados",  value: String(metricas.rechazados), r: 220, g: 38,  b: 38 },
    ]);

    // ── Sección 2: Adopciones ──
    if (resumenAdopciones) {
      sectionTitle("Solicitudes de Adopción");
      metricGrid([
        { label: "Total solicitudes", value: String(resumenAdopciones.total_solicitudes) },
        { label: "Aprobadas",         value: String(resumenAdopciones.total_aprobadas),  r: 22,  g: 163, b: 74 },
        { label: "Rechazadas",        value: String(resumenAdopciones.total_rechazadas), r: 220, g: 38,  b: 38 },
        { label: "Tasa de adopción",  value: `${resumenAdopciones.tasa_adopcion}%`,      r: 79,  g: 70,  b: 229 },
        { label: "En revisión",       value: String(resumenAdopciones.total_en_revision) },
        { label: "En espera",         value: String(resumenAdopciones.total_en_espera) },
      ]);
    }

    // ── Sección 3: Por mes ──
    if (porMes.length > 0) {
      sectionTitle("Adopciones por mes (últimos 6 meses)");
      dataTable(
        ["Mes", "Aprobadas", "Rechazadas", "Total"],
        porMes.map((m) => [m.mes, String(m.aprobadas), String(m.rechazadas), String(m.total)]),
        { 1: [22, 163, 74], 2: [220, 38, 38] }
      );
    }

    // ── Sección 4: Por especie ──
    if (porEspecie.length > 0) {
      sectionTitle("Adopciones por especie");
      dataTable(
        ["Especie", "Aprobadas", "Total solicitudes"],
        porEspecie.map((e) => [e.especie, String(e.aprobadas), String(e.total)]),
        { 1: [22, 163, 74] }
      );
    }

    // ── Sección 5: Top refugios ──
    if (topRefugios.length > 0) {
      sectionTitle("Top 5 refugios con más adopciones");
      dataTable(
        ["Refugio", "Adopciones aprobadas"],
        topRefugios.map((r) => [r.nom_refug, String(r.adopciones)]),
        { 1: [79, 70, 229] }
      );
    }

    // ── Sección 6: Últimos usuarios ──
    sectionTitle("Últimos usuarios registrados");
    dataTable(
      ["Nombre", "Correo", "Rol", "Estado", "Registro"],
      ultimosUsuarios.map((u) => [
        `${u.nombre} ${u.apellido ?? ""}`.trim(),
        u.correo,
        u.rol,
        u.activo ? "Activo" : "Bloqueado",
        u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-BO") : "-",
      ])
    );

    // ── Pie de página ──
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${p} de ${totalPages}  ·  AdoptaMe — Sistema de Gestión de Adopciones`,
        M,
        doc.internal.pageSize.getHeight() - 8
      );
    }

    doc.save(`reporte-adoptame-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) return <div className="admin-reportes__empty">Cargando reportes...</div>;

  return (
    <div className="admin-reportes">
      <div className="admin-reportes__header">
        <div>
          <h2>Reportes</h2>
          <p>Vista consolidada para seguimiento administrativo.</p>
        </div>
        <div className="admin-reportes__actions">
          <button onClick={cargarDatos} type="button">Actualizar</button>
          <button className="admin-reportes__primary" onClick={() => setPreview(true)} type="button">
            ⬇ Descargar PDF
          </button>
        </div>
      </div>

      {mensaje && <div className="admin-reportes__message">{mensaje}</div>}

      {/* Métricas usuarios y refugios */}
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
        Usuarios y Refugios
      </h3>
      <div className="admin-reportes__grid" style={{ marginBottom: 28 }}>
        <article className="admin-reportes__metric"><span>Adoptantes</span><strong>{metricas.adoptantes}</strong></article>
        <article className="admin-reportes__metric"><span>Refugios registrados</span><strong>{metricas.refugiosUsuarios}</strong></article>
        <article className="admin-reportes__metric"><span>Usuarios bloqueados</span><strong>{metricas.bloqueados}</strong></article>
        <article className="admin-reportes__metric admin-reportes__metric--warning"><span>Refugios pendientes</span><strong>{metricas.pendientes}</strong></article>
        <article className="admin-reportes__metric admin-reportes__metric--success"><span>Refugios aprobados</span><strong>{metricas.aprobados}</strong></article>
        <article className="admin-reportes__metric admin-reportes__metric--danger"><span>Refugios rechazados</span><strong>{metricas.rechazados}</strong></article>
      </div>

      {/* HU-28: Métricas de adopciones */}
      {resumenAdopciones && (
        <>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Solicitudes de Adopción
          </h3>
          <div className="admin-reportes__grid" style={{ marginBottom: 28 }}>
            <article className="admin-reportes__metric"><span>Total solicitudes</span><strong>{resumenAdopciones.total_solicitudes}</strong></article>
            <article className="admin-reportes__metric admin-reportes__metric--success"><span>Aprobadas</span><strong>{resumenAdopciones.total_aprobadas}</strong></article>
            <article className="admin-reportes__metric admin-reportes__metric--danger"><span>Rechazadas</span><strong>{resumenAdopciones.total_rechazadas}</strong></article>
            <article className="admin-reportes__metric"><span>Tasa de adopción</span><strong style={{ color: "#4f46e5" }}>{resumenAdopciones.tasa_adopcion}%</strong></article>
            <article className="admin-reportes__metric admin-reportes__metric--warning"><span>En revisión</span><strong>{resumenAdopciones.total_en_revision}</strong></article>
            <article className="admin-reportes__metric"><span>En espera</span><strong>{resumenAdopciones.total_en_espera}</strong></article>
          </div>
        </>
      )}

      {porMes.length > 0 && (
        <div className="admin-reportes__table-wrap" style={{ marginBottom: 24 }}>
          <h3>Adopciones por mes (últimos 6 meses)</h3>
          <table className="admin-reportes__table">
            <thead><tr><th>Mes</th><th>Aprobadas</th><th>Rechazadas</th><th>Total</th></tr></thead>
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

      {porEspecie.length > 0 && (
        <div className="admin-reportes__table-wrap" style={{ marginBottom: 24 }}>
          <h3>Adopciones por especie</h3>
          <table className="admin-reportes__table">
            <thead><tr><th>Especie</th><th>Aprobadas</th><th>Total solicitudes</th></tr></thead>
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

      {topRefugios.length > 0 && (
        <div className="admin-reportes__table-wrap" style={{ marginBottom: 24 }}>
          <h3>Top 5 refugios con más adopciones</h3>
          <table className="admin-reportes__table">
            <thead><tr><th>Refugio</th><th>Adopciones aprobadas</th></tr></thead>
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

      <div className="admin-reportes__table-wrap">
        <h3>Últimos usuarios registrados</h3>
        <table className="admin-reportes__table">
          <thead>
            <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            {ultimosUsuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre} {u.apellido ?? ""}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? "Activo" : "Bloqueado"}</td>
                <td>{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-BO") : "-"}</td>
              </tr>
            ))}
            {ultimosUsuarios.length === 0 && (
              <tr><td colSpan={5}>Sin usuarios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal vista previa ── */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, maxWidth: 680, width: "100%", maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>

            {/* Header modal */}
            <div style={{ padding: "18px 24px", background: "#1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, color: "#f9fafb", fontSize: 16, fontWeight: 700 }}>Vista previa del reporte</h2>
                <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 12 }}>
                  {new Date().toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => setPreview(false)}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 22, lineHeight: 1 }}
              >✕</button>
            </div>

            {/* Contenido scrollable */}
            <div style={{ flex: 1, overflow: "auto", padding: 24 }}>

              {/* Usuarios y refugios */}
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Usuarios y Refugios</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                {[
                  { l: "Adoptantes",    v: metricas.adoptantes },
                  { l: "Refugios",      v: metricas.refugiosUsuarios },
                  { l: "Bloqueados",    v: metricas.bloqueados },
                  { l: "Pendientes",    v: metricas.pendientes },
                  { l: "Aprobados",     v: metricas.aprobados },
                  { l: "Rechazados",    v: metricas.rechazados },
                ].map(({ l, v }) => (
                  <div key={l} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", background: "#fafbfc" }}>
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Adopciones */}
              {resumenAdopciones && (
                <>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Solicitudes de Adopción</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                    {[
                      { l: "Total",       v: resumenAdopciones.total_solicitudes },
                      { l: "Aprobadas",   v: resumenAdopciones.total_aprobadas,  color: "#16a34a" },
                      { l: "Rechazadas",  v: resumenAdopciones.total_rechazadas, color: "#dc2626" },
                      { l: "Tasa",        v: `${resumenAdopciones.tasa_adopcion}%`, color: "#4f46e5" },
                      { l: "En revisión", v: resumenAdopciones.total_en_revision },
                      { l: "En espera",   v: resumenAdopciones.total_en_espera },
                    ].map(({ l, v, color }) => (
                      <div key={l} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", background: "#fafbfc" }}>
                        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: color ?? "#111827" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Tabla por mes */}
              {porMes.length > 0 && (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Por mes</p>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Mes", "Aprobadas", "Rechazadas", "Total"].map((h) => (
                          <th key={h} style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {porMes.map((m) => (
                        <tr key={m.mes} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "6px 8px", color: "#374151" }}>{m.mes}</td>
                          <td style={{ padding: "6px 8px", color: "#16a34a", fontWeight: 600 }}>{m.aprobadas}</td>
                          <td style={{ padding: "6px 8px", color: "#dc2626", fontWeight: 600 }}>{m.rechazadas}</td>
                          <td style={{ padding: "6px 8px", color: "#374151" }}>{m.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Top refugios */}
              {topRefugios.length > 0 && (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Top refugios</p>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Refugio", "Adopciones"].map((h) => (
                          <th key={h} style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topRefugios.map((r) => (
                        <tr key={r.nom_refug} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "6px 8px", color: "#374151" }}>{r.nom_refug}</td>
                          <td style={{ padding: "6px 8px", color: "#4f46e5", fontWeight: 700 }}>{r.adopciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
                El PDF incluye todas las secciones y tiene paginación automática.
              </p>
            </div>

            {/* Footer modal */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 12, background: "#fafbfc" }}>
              <button
                onClick={() => setPreview(false)}
                style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { generarPdf(); setPreview(false); }}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#1f2937", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
              >
                ⬇ Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesAdminMF;