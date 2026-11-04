import { Router } from 'express';
import { getObjetosOficina, getObjetosPerdidosPublico } from '../controllers/objetoPerdido.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { filtroObjetoOficinaSchema } from '../schemas/objetoPerdido.schema.js';

const router = Router();

router.get('/publico', getObjetosPerdidosPublico);

router.get('/oficina', autenticacion, validate(filtroObjetoOficinaSchema,"query","vQuery"), getObjetosOficina);

export default router;
