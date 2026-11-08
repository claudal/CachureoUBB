import { Router } from 'express';
import { getCampuses, getOficinasCampus } from '../controllers/campus.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { parametroCampusSchema } from '../schemas/campus.schema.js';
import { autenticacion } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getCampuses);

router.get('/:id/oficinas/',autenticacion("administrador"),validate(parametroCampusSchema,"params"),getOficinasCampus)

export default router;
