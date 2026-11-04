import { Router } from 'express';
import { getObjetosOficina, postObjetoPerdido, getObjetosPerdidosPublico } from '../controllers/objetoPerdido.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { subirFotosObjeto } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearObjetoPerdidoSchema, filtroObjetoOficinaSchema } from '../schemas/objetoPerdido.schema.js';

const router = Router();

// multer va antes de validate porque es multer el que llena req.body con los campos del formulario
router.post('/', autenticacion, subirFotosObjeto, validate(crearObjetoPerdidoSchema), postObjetoPerdido);

router.get('/publico', getObjetosPerdidosPublico);

router.get('/oficina', autenticacion, validate(filtroObjetoOficinaSchema,"query","vQuery"), getObjetosOficina);

export default router;
