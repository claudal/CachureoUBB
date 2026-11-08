import { Router } from 'express';
import { getEncargados, postEncargado, postReenviarCorreoCreacionEncargado } from '../controllers/encargadoOficina.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearEncargadoOficinaSchema, filtroEncargadoOficinaSchema, parametroEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';

const router = Router();

router.get('/',autenticacion,validate(filtroEncargadoOficinaSchema,"query","vQuery"), getEncargados);
router.post('/', autenticacion, validate(crearEncargadoOficinaSchema), postEncargado);
router.post('/:rut/reenviarCorreoCreacion', autenticacion, validate(parametroEncargadoOficinaSchema,"params"), postReenviarCorreoCreacionEncargado);

export default router;
