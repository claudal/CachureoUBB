import { Router } from 'express';
import { getEncargados } from '../controllers/encargadoOficina.controller.js';

const router = Router();

router.get('/', getEncargados);

export default router;
