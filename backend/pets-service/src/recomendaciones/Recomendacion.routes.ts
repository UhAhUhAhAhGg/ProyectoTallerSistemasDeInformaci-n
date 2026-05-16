import { Router } from 'express';
import { getRecomendaciones } from './Recomendacion.controller';
import { extractUser, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', extractUser, requireRole('adoptante'), getRecomendaciones);

export default router;
