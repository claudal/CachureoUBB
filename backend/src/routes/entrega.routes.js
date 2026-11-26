import { Router } from 'express';
import { getEntregasOficina } from '../controllers/entrega.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { filtroEntregaOficinaSchema } from '../schemas/entrega.schema.js';

const router = Router();

router.get('/oficina', autenticacion("encargado"), validate(filtroEntregaOficinaSchema,"query","vQuery"), getEntregasOficina);

export default router;
