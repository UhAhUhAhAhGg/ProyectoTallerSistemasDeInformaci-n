require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// ========================
// MIDDLEWARES
// ========================
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// RUTAS
// ========================

// Ruta raíz - Información del servicio
app.get("/", (req, res) => {
  res.json({
    service: "Auth Service API",
    version: "1.0.0",
    status: "running",
    description: "Microservicio de autenticación",
    endpoints: {
      health: "GET /health",
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      logout: "POST /api/auth/logout",
      getCurrentUser: "GET /api/auth/me"
    },
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "auth-service",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de perfil adoptante
const perfilRoutes = require("./routes/perfil.routes");
app.use("/api/perfil-adoptante", perfilRoutes);

// Rutas de refugio
const refugioRoutes = require("./routes/refugio.routes");
app.use("/api/refugios", refugioRoutes);

// Rutas de notificaciones
const notificacionRoutes = require("./routes/notificacion.routes");
app.use("/api/notificaciones", notificacionRoutes);

// 404 Handler (debe ser el último)
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    message: `La ruta ${req.method} ${req.path} no existe`,
    availableEndpoints: "GET /"
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : undefined
  });
});

// ========================
// SERVIDOR
// ========================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║        Auth Service Running            ║
╠════════════════════════════════════════╣
║  🚀 Port:        ${String(PORT).padEnd(18)} ║
║  📍 Environment: ${String(NODE_ENV).padEnd(18)} ║
║  🔗 URL:         http://localhost:${String(PORT).padEnd(12)} ║
║  ✅ Health:      /health                 ║
╚════════════════════════════════════════╝
  `);
});