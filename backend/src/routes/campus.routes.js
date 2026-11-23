import { Router } from 'express';
import { deleteCampus, getCampuses, getOficinasCampus, postCampus, putCampus } from '../controllers/campus.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { campusSchema, parametroCampusSchema } from '../schemas/campus.schema.js';
import { autenticacion } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getCampuses);

router.get('/:id/oficinas/',autenticacion("administrador"),validate(parametroCampusSchema,"params"),getOficinasCampus)

router.post('/', autenticacion("administrador"), validate(campusSchema), postCampus);
router.put('/:id', autenticacion("administrador"), validate(parametroCampusSchema,"params"), validate(campusSchema), putCampus);
router.delete('/:id', autenticacion("administrador"), validate(parametroCampusSchema,"params"), deleteCampus);

export default router;
