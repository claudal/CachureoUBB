import { Router } from 'express';
import { getEncargados, postEncargado } from '../controllers/encargadoOficina.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';

const router = Router();

router.get('/', getEncargados);
router.post('/', autenticacion, validate(crearEncargadoOficinaSchema), postEncargado);

export default router;
