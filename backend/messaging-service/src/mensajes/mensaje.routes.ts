import { Router }                          from 'express';
import { extractUser, requireRole }        from '../middlewares/auth.middleware';
import {
  enviarMensaje,
  getConversaciones,
  getMensajesDeConversacion,
  marcarLeidos,
  getNoLeidos,
} from './mensaje.controller';

const router = Router();

router.use(extractUser);

// Todos los roles autenticados pueden usar la mensajería
router.post(
  '/mensajes',
  requireRole('adoptante', 'refugio'),
  enviarMensaje,
);

router.get(
  '/conversaciones',
  requireRole('adoptante', 'refugio', 'administrador'),
  getConversaciones,
);

router.get(
  '/conversaciones/:id/mensajes',
  requireRole('adoptante', 'refugio', 'administrador'),
  getMensajesDeConversacion,
);

router.patch(
  '/conversaciones/:id/leidos',
  requireRole('adoptante', 'refugio'),
  marcarLeidos,
);

router.get(
  '/no-leidos',
  requireRole('adoptante', 'refugio', 'administrador'),
  getNoLeidos,
);

export default router;
