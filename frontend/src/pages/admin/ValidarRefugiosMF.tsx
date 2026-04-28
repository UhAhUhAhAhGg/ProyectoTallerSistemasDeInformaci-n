import React, { useEffect, useState } from "react";

interface Refugio {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: string;
  estado: "pendiente" | "aprobado" | "rechazado";
}

interface Props {
  onClose?: () => void;
}

// ✅ Apunta al auth-service en :3001
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ValidarRefugiosMF: React.FC<Props> = ({ onClose }) => {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const [filtro, setFiltro] = useState<"pendiente" | "aprobado" | "rechazado">("pendiente");

  const token = localStorage.getItem("token");

  const fetchRefugios = async () => {
    setLoading(true);
    try {
      // ✅ Ruta correcta del backend: /api/refugios/admin/solicitudes
      // Pero trae solo pendientes — para ver todos necesitamos adaptarlo
      const res = await fetch(`${API_BASE}/refugios/admin/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener refugios");
      const data = await res.json();
      const raw: any[] = data.data ?? data;

      // Mapear los campos del backend a la interfaz del componente
      setRefugios(
        raw.map((r: any) => ({
          id: String(r.id_refug),
          nombre: r.nom_refug,
          correo: r.corr_usuario,
          telefono: r.telf_refug,
          direccion: r.dir_refug,
          fechaRegistro: r.fecha_solicitud,
          estado: r.est_aprobacion as "pendiente" | "aprobado" | "rechazado",
        }))
      );
    } catch {
      setMensaje({ texto: "No se pudieron cargar los refugios.", tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefugios();
  }, []);

  const accion = async (id: string, estado: "aprobado" | "rechazado") => {
    setProcesando(id);
    setMensaje(null);
    try {
      // ✅ Ruta correcta: PATCH /api/refugios/admin/refugio/:id/estado
      const res = await fetch(`${API_BASE}/refugios/admin/refugio/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      // Actualizar estado local sin recargar todo
      setRefugios((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado } : r))
      );
      setMensaje({
        texto: estado === "aprobado" ? "Refugio aprobado correctamente." : "Refugio rechazado.",
        tipo: "ok",
      });
    } catch {
      setMensaje({ texto: "Error al procesar la solicitud.", tipo: "error" });
    } finally {
      setProcesando(null);
    }
  };

  const refugiosFiltrados = refugios.filter((r) => r.estado === filtro);

  const badgeColor: Record<string, string> = {
    pendiente: "#f59e0b",
    aprobado: "#10b981",
    rechazado: "#ef4444",
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1f2937" }}>
            Validar Refugios
          </h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
            Revisa y aprueba las solicitudes de registro de nuevos refugios.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#9ca3af" }}>
            ✕
          </button>
        )}
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div style={{
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
          color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
          fontSize: "0.88rem",
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {(["pendiente", "aprobado", "rechazado"] as const).map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: filtro === estado ? 700 : 400,
              fontSize: "0.82rem",
              background: filtro === estado ? badgeColor[estado] : "#f3f4f6",
              color: filtro === estado ? "#fff" : "#374151",
              transition: "all 0.15s",
            }}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}{" "}
            <span style={{
              background: "rgba(255,255,255,0.3)",
              borderRadius: "10px",
              padding: "0 6px",
              fontSize: "0.75rem",
            }}>
              {refugios.filter((r) => r.estado === estado).length}
            </span>
          </button>
        ))}
        <button
          onClick={fetchRefugios}
          style={{ marginLeft: "auto", padding: "0.4rem 0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.82rem", color: "#374151" }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Cargando...</div>
      ) : refugiosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          No hay refugios en estado "{filtro}".
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {refugiosFiltrados.map((refugio) => (
            <div
              key={refugio.id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111827" }}>
                    {refugio.nombre}
                  </span>
                  <span style={{
                    fontSize: "0.72rem",
                    padding: "0.15rem 0.6rem",
                    borderRadius: "12px",
                    background: badgeColor[refugio.estado] + "22",
                    color: badgeColor[refugio.estado],
                    fontWeight: 600,
                  }}>
                    {refugio.estado}
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                  📧 {refugio.correo}
                  {refugio.telefono && <span style={{ marginLeft: "0.75rem" }}>📞 {refugio.telefono}</span>}
                </div>
                {refugio.direccion && (
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.2rem" }}>
                    📍 {refugio.direccion}
                  </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#d1d5db", marginTop: "0.35rem" }}>
                  Registrado: {refugio.fechaRegistro ? new Date(refugio.fechaRegistro).toLocaleDateString("es-BO") : "—"}
                </div>
              </div>

              {/* Acciones — solo para pendientes */}
              {refugio.estado === "pendiente" && (
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    disabled={procesando === refugio.id}
                    onClick={() => accion(refugio.id, "aprobado")}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "#10b981",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: procesando === refugio.id ? "not-allowed" : "pointer",
                      opacity: procesando === refugio.id ? 0.6 : 1,
                    }}
                  >
                    ✓ Aprobar
                  </button>
                  <button
                    disabled={procesando === refugio.id}
                    onClick={() => accion(refugio.id, "rechazado")}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: procesando === refugio.id ? "not-allowed" : "pointer",
                      opacity: procesando === refugio.id ? 0.6 : 1,
                    }}
                  >
                    ✕ Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidarRefugiosMF;