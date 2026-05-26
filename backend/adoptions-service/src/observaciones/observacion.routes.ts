import express from 'express';
import { extractUser, requireRole } from '../middlewares/auth.middleware';
import * as ctrl from './observacion.controller';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// RUTAS: Observaciones y Seguimiento
// ═══════════════════════════════════════════════════════════════

// ── OBSERVACIONES DE ADAPTACIÓN (Refugio) ─────────────────────

// POST /observaciones — El refugio registra una observación
router.post('/', extractUser, requireRole('refugio'), ctrl.crearObservacion);

// GET /observaciones/:id_soli — Obtener observaciones de una solicitud
router.get('/:id_soli', extractUser, ctrl.obtenerObservacionesSolicitud);

// ── SEGUIMIENTO DE ADOPCIÓN (Adoptante) ──────────────────────

// POST /seguimientos — El adoptante reporta una novedad
router.post('/seguimientos', extractUser, requireRole('adoptante'), ctrl.crearSeguimiento);

// GET /seguimientos/:id_soli — Obtener seguimientos de una solicitud
router.get('/seguimientos/:id_soli', extractUser, ctrl.obtenerSeguimientoSolicitud);

export default router;
