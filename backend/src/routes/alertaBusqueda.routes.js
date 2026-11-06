import { Router } from "express";
import { getAlertaBusqueda, getAlertasBusqueda, postAlertaBusqueda, postSolicitudDetalles } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { filtroAlertaBusquedaSchema, parametroAlertaBusquedaSchema, crearAlertaBusquedaSchema, crearSolicitudDetallesSchema } from "../schemas/alertaBusqueda.schema.js";
import { autenticacion } from "../middlewares/auth.middleware.js";
import { deleteMarcadorAlerta, postMarcadorAlerta } from "../controllers/marcadorAlerta.controller.js";
import { postLecturaAlerta } from "../controllers/lecturaAlerta.controller.js";
import { subirFotos } from "../middlewares/upload.middleware.js";

const router = Router();

router.post('/', subirFotos, validate(crearAlertaBusquedaSchema), postAlertaBusqueda);

router.get('/',autenticacion,validate(filtroAlertaBusquedaSchema, 'query', 'vQuery'), getAlertasBusqueda);
router.get('/:id/',validate(parametroAlertaBusquedaSchema, 'params'), getAlertaBusqueda);


router.post('/:id/marcadores/',autenticacion,validate(parametroAlertaBusquedaSchema,'params'),postMarcadorAlerta);
router.delete('/:id/marcadores/',autenticacion,validate(parametroAlertaBusquedaSchema,'params'),deleteMarcadorAlerta);

router.post('/:id/lecturas/',autenticacion,validate(parametroAlertaBusquedaSchema,'params'),postLecturaAlerta);
router.post('/:id/solicitudesDetalles/',
    autenticacion,
    validate(parametroAlertaBusquedaSchema,'params'),
    validate(crearSolicitudDetallesSchema),
    postSolicitudDetalles);

export default router;