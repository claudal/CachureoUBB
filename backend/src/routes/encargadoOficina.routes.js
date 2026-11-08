import { Router } from 'express';
import { getEncargados, postEncargado, postEnviarCorreoReestablecimientoEncargado, postReenviarCorreoCreacionEncargado } from '../controllers/encargadoOficina.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearEncargadoOficinaSchema, filtroEncargadoOficinaSchema, parametroEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';

const router = Router();

router.get('/',autenticacion("administrador"),validate(filtroEncargadoOficinaSchema,"query","vQuery"), getEncargados);
router.post('/', autenticacion("administrador"), validate(crearEncargadoOficinaSchema), postEncargado);
router.post('/:rut/reenviarCorreoCreacion', autenticacion("administrador"), validate(parametroEncargadoOficinaSchema,"params"), postReenviarCorreoCreacionEncargado);
router.post('/:rut/enviarCorreoRestablecimientoClave', validate(parametroEncargadoOficinaSchema,"params"), postEnviarCorreoReestablecimientoEncargado);

export default router;
