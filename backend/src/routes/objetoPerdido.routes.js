import { Router } from 'express';
import { getObjetosOficina, postObjetoPerdido, getObjetosPerdidosPublico, getObjetoPerdido, putObjetoPerdido, deleteObjetoPerdido } from '../controllers/objetoPerdido.controller.js';
import { autenticacion } from '../middlewares/auth.middleware.js';
import { subirFotos, subirFotoEntrega } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { actualizarObjetoPerdidoSchema, crearObjetoPerdidoSchema, filtroObjetoOficinaSchema, filtroObjetoPublicoSchema, parametroObjetoPerdidoSchema } from '../schemas/objetoPerdido.schema.js';
import { registrarEntregaSchema } from '../schemas/entrega.schema.js';
import { postEntrega } from '../controllers/entrega.controller.js';

const router = Router();

// multer va antes de validate porque es multer el que llena req.body con los campos del formulario
router.post('/', autenticacion, subirFotos, validate(crearObjetoPerdidoSchema), postObjetoPerdido);

router.get('/publico', validate(filtroObjetoPublicoSchema, "query", "vQuery"), getObjetosPerdidosPublico);

router.get('/oficina', autenticacion, validate(filtroObjetoOficinaSchema,"query","vQuery"), getObjetosOficina);
router.get('/:id', autenticacion, validate(parametroObjetoPerdidoSchema,"params"), getObjetoPerdido);
router.put('/:id', autenticacion, validate(parametroObjetoPerdidoSchema,"params"), subirFotos, validate(actualizarObjetoPerdidoSchema), putObjetoPerdido);
router.delete('/:id', autenticacion, validate(parametroObjetoPerdidoSchema,"params"), deleteObjetoPerdido);

router.post('/:id/entrega', autenticacion, validate(parametroObjetoPerdidoSchema,"params"), subirFotoEntrega, validate(registrarEntregaSchema), postEntrega);

export default router;
