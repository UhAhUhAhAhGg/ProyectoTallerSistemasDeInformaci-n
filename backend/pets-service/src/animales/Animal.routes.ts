import { Router } from 'express';
import { extractUser, requireRole } from '../middlewares/auth.middleware';
import * as ctrl from '../animales/Animal.controller';

const router = Router();

// Catálogo público (sin auth)
router.get('/razas',   ctrl.listarRazas);
router.get('/especies', ctrl.listarEspecies);

// Rutas protegidas — solo refugio o admin
router.use(extractUser);

router.get('/',      requireRole('refugio', 'administrador'), ctrl.listarAnimales);   // animales del refugio
router.get('/:id',   ctrl.obtenerAnimal);                                             // detalle
router.post('/',     requireRole('refugio'), ctrl.registrarAnimal);                   // HU-07
router.put('/:id',   requireRole('refugio'), ctrl.editarAnimal);                      // HU-08

export default router;