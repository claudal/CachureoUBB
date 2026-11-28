import { Router } from 'express';
import { deleteEncargado, getEncargados, getNovedades, patchEstadoEncargado, postEncargado, postEnviarCorreoReestablecimientoEncargado, postReenviarCorreoCreacionEncargado, putEncargado } from '../controllers/encargadoOficina.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { cambiarEstadoEncargadoOficinaSchema, crearEncargadoOficinaSchema, editarEncargadoOficinaSchema, filtroEncargadoOficinaSchema, parametroEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';

const router = Router();

router.get('/',autenticacion("administrador"),validate(filtroEncargadoOficinaSchema,"query","vQuery"), getEncargados);
router.post('/', autenticacion("administrador"), validate(crearEncargadoOficinaSchema), postEncargado);
router.put('/:rut', autenticacion("administrador"), validate(parametroEncargadoOficinaSchema,"params"), validate(editarEncargadoOficinaSchema), putEncargado);
router.patch('/:rut/estado', autenticacion("administrador"), validate(parametroEncargadoOficinaSchema,"params"), validate(cambiarEstadoEncargadoOficinaSchema), patchEstadoEncargado);
router.delete('/:rut', autenticacion("administrador"), validate(parametroEncargadoOficinaSchema,"params"), deleteEncargado);
router.post('/:rut/reenviarCorreoCreacion', autenticacion("administrador"), validate(parametroEncargadoOficinaSchema,"params"), postReenviarCorreoCreacionEncargado);
router.post('/:rut/enviarCorreoRestablecimientoClave', validate(parametroEncargadoOficinaSchema,"params"), postEnviarCorreoReestablecimientoEncargado);
router.get('/novedades',autenticacion("encargado"), getNovedades);

export default router;
