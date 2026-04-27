import { Router } from 'express';
import { getCatalogo, getRefugios } from '../catalogo/Catalogo.controller';

const router = Router();

router.get('/',         getCatalogo);   // ?especie=perro&refugioId=1
router.get('/refugios', getRefugios);   // lista para el sidebar

export default router;