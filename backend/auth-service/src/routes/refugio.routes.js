const express = require("express");
const {
  guardarDatos,
  actualizarDatos,
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

router.post("/datos", authMiddleware, rolesMiddleware(['refugio']), guardarDatos);
router.get("/datos", authMiddleware, rolesMiddleware(['refugio']), obtenerDatos);
router.patch("/datos", authMiddleware, rolesMiddleware(['refugio']), actualizarDatos);

// ========================
// RUTAS DE ADMIN (solo admin)
// ========================

router.get("/admin/solicitudes", authMiddleware, adminMiddleware, obtenerSolicitudes);
router.get("/admin/refugio/:id", authMiddleware, adminMiddleware, obtenerRefugio);
router.patch("/admin/refugio/:id/estado", authMiddleware, adminMiddleware, cambiarEstado);

module.exports = router;