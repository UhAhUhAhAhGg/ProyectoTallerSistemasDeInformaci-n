//backend/auth-service/src/routes/auth.routes.js
const express = require("express");
const {
  login,
  registro,
  logout,
  getCurrentUser
} = require("../controllers/auth.controller");

const router = express.Router();

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", registro);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", getCurrentUser);

module.exports = router;