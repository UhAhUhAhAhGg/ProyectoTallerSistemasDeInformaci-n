//backend/auth-service/src/routes/auth.routes.js
const express = require("express");
const {
  login,
  registro,
  registroRefugio,
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

// POST /api/auth/register/refugio
router.post("/register/refugio", registroRefugio);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", getCurrentUser);

const express = require("express");
const {
  login,
  registro,
  registroRefugio,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/register", registro);
router.post("/register/refugio", registroRefugio);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

// HU-05: Recuperación de contraseña
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

module.exports = router;
