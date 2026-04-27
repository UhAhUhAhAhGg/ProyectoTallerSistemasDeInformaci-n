// filepath: src/routes/refugio.routes.js
// backend\auth-service\src\routes\refugio.routes.js
const express = require("express");
const {
  guardarDatos,
  obtenerDatos,
  obtenerSolicitudes,
  obtenerRefugio,
  cambiarEstado
} = require("../controllers/refugio.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { rolesMiddleware, adminMiddleware } = require("../middlewares/roles.middleware");

const router = express.Router();

// ========================
// RUTAS DE REFUGIO
// ========================

// POST /api/refugios/datos - Guardar datos del refugio (requiere auth, rol refugio)
router.post("/datos", authMiddleware, rolesMiddleware(['refugio']), guardarDatos);

// GET /api/refugios/datos - Obtener datos del refugio (requiere auth, rol refugio)
router.get("/datos", authMiddleware, rolesMiddleware(['refugio']), obtenerDatos);

// ========================
// RUTAS DE ADMIN (solo admin)
// ========================

// GET /api/refugios/admin/solicitudes - Listar refugios pendientes
router.get("/admin/solicitudes", authMiddleware, adminMiddleware, obtenerSolicitudes);

// GET /api/refugios/admin/refugio/:id - Ver detalle de un refugio
router.get("/admin/refugio/:id", authMiddleware, adminMiddleware, obtenerRefugio);

// PATCH /api/refugios/admin/refugio/:id/estado - Aprobar o rechazar
router.patch("/admin/refugio/:id/estado", authMiddleware, adminMiddleware, cambiarEstado);

module.exports = router;