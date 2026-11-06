import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { filtroEtiquetaObjetoSchema } from '../schemas/etiquetaObjeto.schema.js';
import { getEtiquetas } from '../controllers/etiquetaObjeto.controller.js';

const router = Router();

router.get('/',validate(filtroEtiquetaObjetoSchema,"query","vQuery"), getEtiquetas);

export default router;
