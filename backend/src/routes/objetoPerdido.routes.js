import { Router } from 'express';
import { getObjetosPerdidos } from '../controllers/objetoPerdido.controller.js';

const router = Router();

router.get('/', getObjetosPerdidos);

export default router;
