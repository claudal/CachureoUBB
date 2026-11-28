import { Router } from 'express';
import { deleteOficina, getOficina, getOficinas, postOficina, putOficina } from '../controllers/oficina.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { subirFotoOficina } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { filtroOficinaSchema, oficinaSchema, parametroOficinaSchema } from '../schemas/oficina.schema.js';

const router = Router();

router.get('/', autenticacion("administrador"), validate(filtroOficinaSchema, "query", "vQuery"), getOficinas);
router.get('/:id', autenticacion("administrador"), validate(parametroOficinaSchema, "params"), getOficina);

// multer va antes de validate porque es multer el que llena req.body con los campos del formulario
router.post('/', autenticacion("administrador"), subirFotoOficina, validate(oficinaSchema), postOficina);
router.put('/:id', autenticacion("administrador"), validate(parametroOficinaSchema, "params"), subirFotoOficina, validate(oficinaSchema), putOficina);
router.delete('/:id', autenticacion("administrador"), validate(parametroOficinaSchema, "params"), deleteOficina);

export default router;
