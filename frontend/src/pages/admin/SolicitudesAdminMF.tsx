import React, { useEffect, useState } from "react";

interface Solicitud {
  id_soli: number;
  nom_mascot: string;
  nom_refug: string;
  nom_usuario: string;
  apell_usuario: string;
  corr_usuario: string;
  nom_est: string;
  fech_soli: string;
  decrip_soli: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ESTADO_COLOR: Record<string, string> = {
  enviada:       "#3b82f6",
  "en revisión": "#f59e0b",
  aprobada:      "#22c55e",
  rechazada:     "#ef4444",
  "en espera":   "#a855f7",
  completada:    "#6366f1",
};

const SolicitudesAdminMF: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE}/admin/solicitudes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSolicitudes(data.data ?? []))
      .catch(() => setError("No se pudieron cargar las solicitudes."))
      .finally(() => setLoading(false));
  }, [token]);

  const estados = ["todos", ...Array.from(new Set(solicitudes.map((s) => s.nom_est.toLowerCase())))];

  const filtradas = solicitudes.filter((s) => {
    const coincideEstado = filtroEstado === "todos" || s.nom_est.toLowerCase() === filtroEstado;
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      !q ||
      s.nom_mascot.toLowerCase().includes(q) ||
      s.nom_refug.toLowerCase().includes(q) ||
      `${s.nom_usuario} ${s.apell_usuario}`.toLowerCase().includes(q) ||
      s.corr_usuario.toLowerCase().includes(q);
    return coincideEstado && coincideBusqueda;
  });

  if (loading) return <p style={{ padding: 20 }}>Cargando solicitudes...</p>;
  if (error) return <p style={{ padding: 20, color: "#dc2626" }}>{error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
        Auditoría de solicitudes
      </h2>

      {/* Controles */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Buscar por mascota, refugio o adoptante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1, minWidth: 220, padding: "8px 12px",
            border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13,
          }}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{
            padding: "8px 12px", border: "1px solid #d1d5db",
            borderRadius: 8, fontSize: 13, background: "#fff",
          }}
        >
          {estados.map((e) => (
            <option key={e} value={e}>
              {e === "todos" ? "Todos los estados" : e.charAt(0).toUpperCase() + e.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
        {filtradas.length} solicitud{filtradas.length !== 1 ? "es" : ""}
      </p>

      {filtradas.length === 0 && (
        <p style={{ color: "#9ca3af", padding: "40px 0", textAlign: "center" }}>
          No hay solicitudes que coincidan con los filtros.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtradas.map((s) => {
          const color = ESTADO_COLOR[s.nom_est.toLowerCase()] ?? "#6b7280";
          return (
            <div
              key={s.id_soli}
              style={{
                border: "1px solid #e5e7eb", borderRadius: 10,
                padding: "14px 16px", background: "#fff",
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{s.nom_mascot}</strong>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>· {s.nom_refug}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                  Adoptante:{" "}
                  <strong>{s.nom_usuario} {s.apell_usuario}</strong>{" "}
                  <span style={{ color: "#6b7280" }}>({s.corr_usuario})</span>
                </p>
                {s.decrip_soli && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>
                    "{s.decrip_soli}"
                  </p>
                )}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
                  {new Date(s.fech_soli).toLocaleDateString("es-BO", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <span
                style={{
                  flexShrink: 0, fontSize: 12, fontWeight: 600,
                  padding: "4px 12px", borderRadius: 20,
                  color, background: color + "20",
                }}
              >
                {s.nom_est}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolicitudesAdminMF;