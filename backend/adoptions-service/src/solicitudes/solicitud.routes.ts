import { Router } from 'express';
import { extractUser, requireRole } from '../middlewares/auth.middleware';
import * as ctrl from './solicitud.controller';

const router = Router();

// Todos los endpoints requieren usuario autenticado
router.use(extractUser);

// ─── HU-17 ────────────────────────────────────────────────────────────────────
// POST /solicitudes — adoptante envía solicitud
router.post(
  '/',
  requireRole('adoptante'),
  ctrl.enviarSolicitud,
);

// ─── HU-18 ────────────────────────────────────────────────────────────────────
// GET /solicitudes/mis — adoptante ve sus propias solicitudes
router.get(
  '/mis',
  requireRole('adoptante'),
  ctrl.getMisSolicitudes,
);

// GET /solicitudes/mis/:id — adoptante ve detalle + historial de una solicitud suya
router.get(
  '/mis/:id',
  requireRole('adoptante'),
  ctrl.getMiSolicitudDetalle,
);

// ─── HU-19 ────────────────────────────────────────────────────────────────────
// GET /solicitudes/refugio — admin/worker ve solicitudes de su refugio
router.get(
  '/refugio',
  requireRole('admin', 'worker'),
  ctrl.getSolicitudesRefugio,
);

// GET /solicitudes/refugio/:id — detalle de una solicitud en el refugio
router.get(
  '/refugio/:id',
  requireRole('admin', 'worker'),
  ctrl.getSolicitudDetalleRefugio,
);

// PATCH /solicitudes/refugio/:id/estado — aprobar / rechazar / en revisión / en espera
router.patch(
  '/refugio/:id/estado',
  requireRole('admin', 'worker'),
  ctrl.cambiarEstado,
);

// ─── Auxiliares ───────────────────────────────────────────────────────────────
// GET /solicitudes/estados — lista de estados disponibles
router.get('/estados', ctrl.getEstados);

// GET /solicitudes/:id/historial — historial de cambios de una solicitud
router.get('/:id/historial', ctrl.getHistorial);

export default router;
