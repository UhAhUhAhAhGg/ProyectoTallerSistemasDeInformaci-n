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
              u.est_usuario AS estado,
              CASE WHEN u.est_usuario = 'bloqueado' THEN false ELSE true END AS activo,
              u.fecha_registro AS "fechaRegistro",
              pa.tipo_vivienda AS "tipoVivienda",
              pa.disp_tiempo AS "disponibilidadTiempo",
              pa.pref_tamanio AS "preferenciaTamanio",
              pa.pref_edad AS "preferenciaEdad",
              e.nom_espe AS "preferenciaEspecie",
              CASE WHEN pa.id_perfil IS NULL THEN false ELSE true END AS "perfilAdoptanteCompleto",
              ref.id_refug AS "idRefugio",
              ref.nom_refug AS "nombreRefugio",
              ref.est_aprobacion AS "estadoRefugio",
              ref.licencia_refug AS "licenciaRefugio"
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       LEFT JOIN PERFIL_ADOPTANTE pa ON pa.id_usuario = u.id_usuario
       LEFT JOIN ESPECIES e ON e.id_espe = pa.pref_especie
       LEFT JOIN REFUGIOS ref ON ref.id_usuario = u.id_usuario
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
