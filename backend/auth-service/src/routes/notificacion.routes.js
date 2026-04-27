// filepath: src/routes/notificacion.routes.js
const express = require("express");
const {
  obtenerNotificaciones,
  obtenerNoLeidas,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotif
} = require("../controllers/notificacion.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// ========================
// RUTAS DE NOTIFICACIONES
// ========================

// GET /api/notificaciones - Obtener todas las notificaciones del usuario
router.get("/", authMiddleware, obtenerNotificaciones);

// GET /api/notificaciones/no-leidas - Obtener notificaciones no leídas
router.get("/no-leidas", authMiddleware, obtenerNoLeidas);

// PATCH /api/notificaciones/:id/leida - Marcar una como leída
router.patch("/:id/leida", authMiddleware, marcarLeida);

// PATCH /api/notificaciones/leer-todas - Marcar todas como leídas
router.patch("/leer-todas", authMiddleware, marcarTodasLeidas);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete("/:id", authMiddleware, eliminarNotif);

module.exports = router;