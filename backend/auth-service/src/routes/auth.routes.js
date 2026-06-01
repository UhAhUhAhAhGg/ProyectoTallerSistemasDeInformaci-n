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