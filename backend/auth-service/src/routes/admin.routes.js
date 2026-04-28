const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middlewares/auth.middleware");
const { adminMiddleware } = require("../middlewares/roles.middleware");

// GET /api/admin/usuarios
router.get("/usuarios", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario AS id,
              u.nom_usuario AS nombre,
              u.apell_usuario AS apellido,
              u.corr_usuario AS correo,
              r.nom_rol AS rol,
              CASE WHEN u.est_usuario = 'bloqueado' THEN false ELSE true END AS activo,
              u.fecha_registro AS "fechaRegistro"
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       ORDER BY u.fecha_registro DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, mensaje: "Error al obtener usuarios" });
  }
});

// PUT /api/admin/usuarios/:id/estado
router.put("/usuarios/:id/estado", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    const est = activo ? "activo" : "bloqueado";
    await pool.query(
      "UPDATE USUARIOS SET est_usuario = $1 WHERE id_usuario = $2",
      [est, id]
    );
    res.json({ success: true, mensaje: `Usuario ${est}` });
  } catch (err) {
    res.status(500).json({ success: false, mensaje: "Error al actualizar usuario" });
  }
});

module.exports = router;