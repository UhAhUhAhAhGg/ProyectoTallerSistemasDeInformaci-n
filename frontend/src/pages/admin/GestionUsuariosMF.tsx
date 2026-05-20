import React, { useEffect, useState } from "react";

interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  correo: string;
  rol: "adoptante" | "refugio" | "administrador";
  estado?: string;
  activo: boolean;
  fechaRegistro: string;
  tipoVivienda?: string | null;
  disponibilidadTiempo?: string | null;
  preferenciaEspecie?: string | null;
  preferenciaTamanio?: string | null;
  preferenciaEdad?: string | null;
  perfilAdoptanteCompleto?: boolean;
  idRefugio?: number | null;
  nombreRefugio?: string | null;
  estadoRefugio?: "pendiente" | "aprobado" | "rechazado" | null;
  licenciaRefugio?: string | null;
}

interface Props {
  onClose?: () => void;
}

// ✅ Sin /api al final — las rutas ya lo incluyen
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ROL_LABEL: Record<string, string> = {
  adoptante: "Adoptante",
  refugio: "Refugio",
  administrador: "Admin",
};

const ROL_COLOR: Record<string, string> = {
  adoptante: "#5b8fa8",
  refugio: "#c97d4e",
  administrador: "#7c3aed",
};

const estadoPerfil = (usuario: Usuario) => {
  if (usuario.rol === "adoptante") {
    return usuario.perfilAdoptanteCompleto ? "Perfil completo" : "Perfil pendiente";
  }
  if (usuario.rol === "refugio") {
    if (usuario.estadoRefugio === "aprobado") return "Refugio aprobado";
    if (usuario.estadoRefugio === "rechazado") return "Refugio rechazado";
    return "Refugio pendiente";
  }
  return "Administrador";
};

const estadoPerfilColor = (usuario: Usuario) => {
  if (usuario.rol === "adoptante") return usuario.perfilAdoptanteCompleto ? "#10b981" : "#f59e0b";
  if (usuario.rol === "refugio") {
    if (usuario.estadoRefugio === "aprobado") return "#10b981";
    if (usuario.estadoRefugio === "rechazado") return "#ef4444";
    return "#f59e0b";
  }
  return "#7c3aed";
};

const GestionUsuariosMF: React.FC<Props> = ({ onClose }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const token = localStorage.getItem("token");

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      // ✅ API_BASE ya tiene /api, así que la ruta es /admin/usuarios
      const res = await fetch(`${API_BASE}/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      // El backend devuelve array directo (sin wrapper success/data)
      setUsuarios(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      setMensaje({ texto: "No se pudieron cargar los usuarios.", tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const toggleEstado = async (usuario: Usuario) => {
    const nuevoEstado = !usuario.activo;
    setProcesando(usuario.id);
    setMensaje(null);
    try {
      // ✅ PUT /api/admin/usuarios/:id/estado
      const res = await fetch(`${API_BASE}/admin/usuarios/${usuario.id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, activo: nuevoEstado } : u))
      );
      setMensaje({
        texto: nuevoEstado
          ? `Cuenta de ${usuario.nombre} reactivada correctamente.`
          : `Cuenta de ${usuario.nombre} bloqueada correctamente.`,
        tipo: "ok",
      });
    } catch {
      setMensaje({ texto: "Error al cambiar el estado del usuario.", tipo: "error" });
    } finally {
      setProcesando(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombre} ${u.apellido || ""} ${u.correo}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activo" ? u.activo : !u.activo);
    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const resumen = {
    adoptantes: usuarios.filter((u) => u.rol === "adoptante").length,
    refugios: usuarios.filter((u) => u.rol === "refugio").length,
    pendientes: usuarios.filter(
      (u) =>
        (u.rol === "adoptante" && !u.perfilAdoptanteCompleto) ||
        (u.rol === "refugio" && u.estadoRefugio === "pendiente")
    ).length,
    bloqueados: usuarios.filter((u) => !u.activo).length,
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1f2937" }}>
            Gestion de Perfiles
          </h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
            Revisa perfiles de adoptantes y refugios, y administra el estado de sus cuentas.
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Adoptantes", value: resumen.adoptantes, color: "#5b8fa8" },
          { label: "Refugios", value: resumen.refugios, color: "#c97d4e" },
          { label: "Perfiles pendientes", value: resumen.pendientes, color: "#f59e0b" },
          { label: "Cuentas bloqueadas", value: resumen.bloqueados, color: "#ef4444" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "0.85rem 1rem",
              background: "#fafbfc",
            }}
          >
            <span style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", fontWeight: 700 }}>{item.label}</span>
            <strong style={{ display: "block", marginTop: "0.25rem", color: item.color, fontSize: "1.6rem" }}>{item.value}</strong>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1, minWidth: "200px", padding: "0.5rem 0.85rem",
            borderRadius: "8px", border: "1px solid #d1d5db",
            fontSize: "0.85rem", outline: "none",
          }}
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={{ padding: "0.5rem 0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.85rem", background: "#fff", cursor: "pointer" }}
        >
          <option value="todos">Todos los roles</option>
          <option value="adoptante">Adoptantes</option>
          <option value="refugio">Refugios</option>
          <option value="administrador">Admins</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ padding: "0.5rem 0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.85rem", background: "#fff", cursor: "pointer" }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
        <button
          onClick={fetchUsuarios}
          style={{ padding: "0.5rem 0.85rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
        >
          🔄
        </button>
        <span style={{ fontSize: "0.8rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
          {usuariosFiltrados.length} usuario(s)
        </span>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Cargando...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          No se encontraron usuarios.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {usuariosFiltrados.map((usuario) => (
            <div
              key={usuario.id}
              style={{
                background: usuario.activo ? "#fff" : "#fef2f2",
                border: `1px solid ${usuario.activo ? "#e5e7eb" : "#fca5a5"}`,
                borderRadius: "10px",
                padding: "0.9rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                opacity: usuario.activo ? 1 : 0.85,
              }}
            >
              {/* Avatar + Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1 }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: ROL_COLOR[usuario.rol] + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", flexShrink: 0,
                }}>
                  {usuario.rol === "adoptante" ? "👤" : usuario.rol === "refugio" ? "🏠" : "⚙️"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#111827" }}>
                      {usuario.rol === "refugio" && usuario.nombreRefugio
                        ? usuario.nombreRefugio
                        : `${usuario.nombre} ${usuario.apellido || ""}`}
                    </span>
                    <span style={{
                      fontSize: "0.7rem", padding: "0.1rem 0.55rem", borderRadius: "10px",
                      background: ROL_COLOR[usuario.rol] + "22", color: ROL_COLOR[usuario.rol], fontWeight: 600,
                    }}>
                      {ROL_LABEL[usuario.rol]}
                    </span>
                    {!usuario.activo && (
                      <span style={{
                        fontSize: "0.7rem", padding: "0.1rem 0.55rem", borderRadius: "10px",
                        background: "#fee2e2", color: "#dc2626", fontWeight: 600,
                      }}>
                        🔒 Bloqueado
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: "0.35rem" }}>
                    <span style={{
                      fontSize: "0.7rem", padding: "0.1rem 0.55rem", borderRadius: "10px",
                      background: estadoPerfilColor(usuario) + "22", color: estadoPerfilColor(usuario), fontWeight: 600,
                    }}>
                      {estadoPerfil(usuario)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.15rem" }}>
                    {usuario.correo}
                  </div>
                  {usuario.rol === "adoptante" && usuario.perfilAdoptanteCompleto && (
                    <div style={{ fontSize: "0.76rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      Vivienda: {usuario.tipoVivienda || "Sin dato"} - Tiempo: {usuario.disponibilidadTiempo || "Sin dato"} - Preferencia: {usuario.preferenciaEspecie || "Sin especie"}
                    </div>
                  )}
                  {usuario.rol === "refugio" && (
                    <div style={{ fontSize: "0.76rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      Responsable: {usuario.nombre} {usuario.apellido || ""} - Licencia: {usuario.licenciaRefugio || "Sin dato"}
                    </div>
                  )}
                  <div style={{ fontSize: "0.72rem", color: "#d1d5db", marginTop: "0.15rem" }}>
                    Registrado: {usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString("es-BO") : "—"}
                  </div>
                </div>
              </div>

              {/* Acción — no permitir bloquear admins */}
              {usuario.rol !== "administrador" && (
                <button
                  disabled={procesando === usuario.id}
                  onClick={() => toggleEstado(usuario)}
                  style={{
                    padding: "0.45rem 1rem", borderRadius: "8px", border: "none",
                    background: usuario.activo ? "#ef4444" : "#10b981",
                    color: "#fff", fontWeight: 600, fontSize: "0.82rem",
                    cursor: procesando === usuario.id ? "not-allowed" : "pointer",
                    opacity: procesando === usuario.id ? 0.6 : 1,
                    flexShrink: 0, minWidth: "100px",
                  }}
                >
                  {procesando === usuario.id ? "..." : usuario.activo ? "🔒 Bloquear" : "🔓 Reactivar"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionUsuariosMF;
