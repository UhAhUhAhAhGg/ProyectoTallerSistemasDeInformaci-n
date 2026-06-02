require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const perfilRoutes = require("./routes/perfil.routes");
const refugioRoutes = require("./routes/refugio.routes");
const notificacionRoutes = require("./routes/notificacion.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5174",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "auth-service",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/perfil-adoptante", perfilRoutes);
app.use("/api/refugios", refugioRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `La ruta ${req.method} ${req.path} no existe`,
    availableEndpoints: "GET /"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : undefined
  });
});

module.exports = app;