import { Router } from 'express';
import { extractUser, requireRole } from '../middlewares/auth.middleware';
import * as ctrl from '../publicaciones/Publicacion.controller';

const router = Router();

router.use(extractUser);

router.get('/',       requireRole('refugio', 'administrador'), ctrl.listarPublicaciones);  // mis publicaciones
router.post('/',      requireRole('refugio'), ctrl.crearPublicacion);                      // HU-07 (publicar)
router.get('/:id',   ctrl.obtenerPublicacion);                                             // detalle público
router.put('/:id',   requireRole('refugio'), ctrl.editarPublicacion);                      // HU-08
router.patch('/:id/estado', requireRole('refugio'), ctrl.cambiarEstado);                   // HU-09
router.patch('/:id/baja',   requireRole('refugio'), ctrl.darDeBaja);                       // HU-11

export default router;