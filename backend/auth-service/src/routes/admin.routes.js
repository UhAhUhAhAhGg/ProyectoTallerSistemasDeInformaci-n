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
    console.error('[ADMIN usuarios] Error:', err.message);
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
    console.error('[ADMIN estado] Error:', err.message);
    res.status(500).json({ success: false, mensaje: "Error al actualizar usuario" });
  }
});

// ─── HU-28: Reporte ampliado ───────────────────────────────────────────────────
// GET /api/admin/reporte
router.get("/reporte", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [estadosResult, porMesResult, porEspecieResult, topRefugiosResult] = await Promise.all([
      // Resumen global de solicitudes
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE sa.id_est = 3) AS total_aprobadas,
          COUNT(*) FILTER (WHERE sa.id_est = 4) AS total_rechazadas,
          COUNT(*) FILTER (WHERE sa.id_est = 1) AS total_enviadas,
          COUNT(*) FILTER (WHERE sa.id_est = 2) AS total_en_revision,
          COUNT(*) FILTER (WHERE sa.id_est = 5) AS total_en_espera,
          COUNT(*)                               AS total_solicitudes
        FROM SOLI_ADOP sa
      `),

      // Adopciones agrupadas por mes (últimos 6 meses)
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', sa.fech_soli), 'YYYY-MM') AS mes,
          COUNT(*) FILTER (WHERE sa.id_est = 3) AS aprobadas,
          COUNT(*) FILTER (WHERE sa.id_est = 4) AS rechazadas,
          COUNT(*)                               AS total
        FROM SOLI_ADOP sa
        WHERE sa.fech_soli >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', sa.fech_soli)
        ORDER BY mes ASC
      `),

      // Adopciones por especie
      pool.query(`
        SELECT
          e.nom_espe AS especie,
          COUNT(*) FILTER (WHERE sa.id_est = 3) AS aprobadas,
          COUNT(*)                               AS total
        FROM SOLI_ADOP sa
        JOIN PUBLICACIONES p ON p.id_publi = sa.id_publi
        JOIN MASCOTAS m      ON m.id_mascot = p.id_mascot
        JOIN RAZAS r         ON r.id_raza   = m.id_raza
        JOIN ESPECIES e      ON e.id_espe   = r.id_espe
        GROUP BY e.nom_espe
        ORDER BY aprobadas DESC
      `),

      // Top 5 refugios con más adopciones aprobadas
      pool.query(`
        SELECT
          ref.nom_refug,
          COUNT(*) FILTER (WHERE sa.id_est = 3) AS adopciones
        FROM SOLI_ADOP sa
        JOIN PUBLICACIONES p ON p.id_publi = sa.id_publi
        JOIN REFUGIOS ref    ON ref.id_refug = p.id_refug
        GROUP BY ref.nom_refug
        ORDER BY adopciones DESC
        LIMIT 5
      `),
    ]);

    const estados = estadosResult.rows[0];
    const total     = Number(estados.total_solicitudes ?? 0);
    const aprobadas = Number(estados.total_aprobadas   ?? 0);

    res.json({
      success: true,
      data: {
        resumen: {
          total_solicitudes: total,
          total_aprobadas:   aprobadas,
          total_rechazadas:  Number(estados.total_rechazadas  ?? 0),
          total_enviadas:    Number(estados.total_enviadas    ?? 0),
          total_en_revision: Number(estados.total_en_revision ?? 0),
          total_en_espera:   Number(estados.total_en_espera   ?? 0),
          tasa_adopcion:     total > 0 ? Math.round((aprobadas / total) * 1000) / 10 : 0,
        },
        por_mes:      porMesResult.rows,
        por_especie:  porEspecieResult.rows,
        top_refugios: topRefugiosResult.rows,
      },
    });
  } catch (err) {
    console.error('[ADMIN reporte] Error:', err.message);
    res.status(500).json({ success: false, mensaje: "Error al generar el reporte" });
  }
});

router.get("/solicitudes", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         s.id_soli,
         s.id_usuario,
         s.id_publi,
         s.id_est,
         s.fech_soli,
         s.decrip_soli,
         e.nom_est,
         p.id_refug,
         m.nom_mascot,
         ref.nom_refug,
         u.nom_usuario,
         u.apell_usuario,
         u.corr_usuario
       FROM SOLI_ADOP s
       JOIN ESTAD_SOLI e    ON e.id_est    = s.id_est
       JOIN PUBLICACIONES p ON p.id_publi  = s.id_publi
       JOIN MASCOTAS m      ON m.id_mascot = p.id_mascot
       JOIN REFUGIOS ref    ON ref.id_refug = p.id_refug
       JOIN USUARIOS u      ON u.id_usuario = s.id_usuario
       ORDER BY s.fech_soli DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[ADMIN solicitudes] Error:', err.message);
    res.status(500).json({ success: false, mensaje: "Error al obtener solicitudes" });
  }
});

module.exports = router;