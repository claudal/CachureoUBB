import { Router } from 'express';
import { getObjetosPerdidos, postObjetoPerdido } from '../controllers/objetoPerdido.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { subirFotosObjeto } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { crearObjetoPerdidoSchema } from '../schemas/objetoPerdido.schema.js';

const router = Router();

router.use(autenticacion);

// base path: /api/objetos
router.get('/', getObjetosPerdidos);
// multer va antes de validate porque es multer el que llena req.body con los campos del formulario
router.post('/', subirFotosObjeto, validate(crearObjetoPerdidoSchema), postObjetoPerdido);

export default router;
