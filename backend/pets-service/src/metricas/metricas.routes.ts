import { Router } from 'express';
import { extractUser, requireRole } from '../middlewares/auth.middleware';
import { getMetricasRefugio } from './metricas.controller';

const router = Router();

router.get(
  '/refugio/:id_refug',
  extractUser,
  requireRole('refugio', 'administrador'),
  getMetricasRefugio,
);

export default router;
