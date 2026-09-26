import { Router } from "express";
import { getAlertasBusqueda } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { filtroAlertaBusquedaSchema, parametroAlertaBusquedaSchema } from "../schemas/alertaBusqueda.schema.js";
import { autenticacion } from "../middlewares/auth.middleware.js";
import { deleteMarcadorAlerta, postMarcadorAlerta } from "../controllers/marcadorAlerta.controller.js";

const router = Router();

router.use(autenticacion);

router.get('/',validate(filtroAlertaBusquedaSchema, 'query', 'vQuery'), getAlertasBusqueda);


router.post('/:id/marcadores/',validate(parametroAlertaBusquedaSchema,'params'),postMarcadorAlerta);
router.delete('/:id/marcadores/',validate(parametroAlertaBusquedaSchema,'params'),deleteMarcadorAlerta);

export default router;