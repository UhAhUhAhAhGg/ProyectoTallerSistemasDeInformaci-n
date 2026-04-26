/**
 * ADMIN-PROF-SERVICE
 * 
 * Microservicio de administración de perfiles de usuarios
 * 
 * Funcionalidades:
 * - Gestión de perfil de usuario (adoptante)
 * - Administración de usuarios (admin)
 * - Control de acceso basado en roles (RBAC)
 * 
 * Puerto: 3002
 */

import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { env, validateEnv } from "./config/env";
import { authenticateUser } from "./middlewares/role.middleware";
import userRoutes from "./user/user.routes";
import { ResponseHelper } from "./utils/response.helper";

// Validar variables de entorno
validateEnv();

// Crear aplicación Express
const app: Express = express();

// ========== MIDDLEWARE GLOBAL ==========

// CORS
app.use(cors({
  origin: "*",
  credentials: true
}));

// Parser de JSON
app.use(express.json());

// Parser de URL-encoded
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Autenticación (simula usuario)
app.use(authenticateUser);

// ========== RUTAS ==========

/**
 * Health Check
 * GET /health
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    service: "admin-prof-service",
    port: env.PORT,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Rutas de usuarios
 * Prefijo: /api/users
 */
app.use("/api/users", userRoutes);

// ========== MANEJO DE ERRORES ==========

/**
 * 404 - Ruta no encontrada
 */
app.use((req: Request, res: Response) => {
  console.log(`[404] Ruta no encontrada: ${req.method} ${req.path}`);
  ResponseHelper.notFound(res, `Ruta ${req.method} ${req.path} no encontrada`);
});

/**
 * Error handler global
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR] Error no manejado:", err);
  ResponseHelper.serverError(
    res,
    "Error interno del servidor",
    env.NODE_ENV === "development" ? err.message : undefined
  );
});

// ========== INICIAR SERVIDOR ==========

const server = app.listen(env.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       ADMIN-PROF-SERVICE INICIADO CORRECTAMENTE         ║
╠══════════════════════════════════════════════════════════╣
║  Servicio: admin-prof-service                           ║
║  Puerto: ${env.PORT}                                        ║
║  Ambiente: ${env.NODE_ENV}                                   ║
║  Health Check: http://localhost:${env.PORT}/health       ║
║                                                          ║
║  Endpoints disponibles:                                 ║
║    - GET    /api/users/profile                          ║
║    - PUT    /api/users/profile                          ║
║    - GET    /api/users                    (admin only)  ║
║    - PUT    /api/users/:id/role           (admin only)  ║
║    - GET    /api/users/role/:role         (admin only)  ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[SERVER] SIGTERM recibido. Cerrando servidor...");
  server.close(() => {
    console.log("[SERVER] Servidor cerrado");
    process.exit(0);
  });
});

export default app;
