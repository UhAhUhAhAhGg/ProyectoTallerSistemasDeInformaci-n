// filepath: src/routes/perfil.routes.js
const express = require("express");
const {
  guardarPerfil,
  obtenerPerfil,
  obtenerEspeciesHandler
} = require("../controllers/perfil.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// ========================
// RUTAS DE PERFIL ADOPTANTE
// ========================

// POST /api/perfil-adoptante - Guardar perfil (requiere auth)
router.post("/", authMiddleware, guardarPerfil);

// GET /api/perfil-adoptante - Obtener perfil (requiere auth)
router.get("/", authMiddleware, obtenerPerfil);

// GET /api/perfil-adoptante/especies - Obtener especies para selectores
router.get("/especies", obtenerEspeciesHandler);

module.exports = router;