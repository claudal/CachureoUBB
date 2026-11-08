import { Router } from "express";
import { getAlertaBusqueda, getAlertaBusquedaNovedad, getAlertasBusqueda, postAlertaBusqueda, postReunion, postSolicitudDetalles } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { filtroAlertaBusquedaSchema, parametroAlertaBusquedaSchema, crearAlertaBusquedaSchema, crearSolicitudDetallesSchema, crearReunionSchema } from "../schemas/alertaBusqueda.schema.js";
import { autenticacion } from "../middlewares/auth.middleware.js";
import { deleteMarcadorAlerta, postMarcadorAlerta } from "../controllers/marcadorAlerta.controller.js";
import { postLecturaAlerta } from "../controllers/lecturaAlerta.controller.js";
import { subirFotos } from "../middlewares/upload.middleware.js";

const router = Router();

router.post('/', subirFotos, validate(crearAlertaBusquedaSchema), postAlertaBusqueda);

router.get('/',autenticacion("encargado"),validate(filtroAlertaBusquedaSchema, 'query', 'vQuery'), getAlertasBusqueda);
router.get('/:id/',validate(parametroAlertaBusquedaSchema, 'params'), getAlertaBusqueda);


router.post('/:id/marcadores/',autenticacion("encargado"),validate(parametroAlertaBusquedaSchema,'params'),postMarcadorAlerta);
router.delete('/:id/marcadores/',autenticacion("encargado"),validate(parametroAlertaBusquedaSchema,'params'),deleteMarcadorAlerta);

router.post('/:id/lecturas/',autenticacion("encargado"),validate(parametroAlertaBusquedaSchema,'params'),postLecturaAlerta);

router.post('/:id/solicitudesDetalles/',
    autenticacion("encargado"),
    validate(parametroAlertaBusquedaSchema,'params'),
    validate(crearSolicitudDetallesSchema),
    postSolicitudDetalles);
router.post('/:id/reuniones/',
    autenticacion("todos"),
    validate(parametroAlertaBusquedaSchema,'params'),
    validate(crearReunionSchema),
    postReunion);
router.get('/:id/solicitudesDetalles/novedad',validate(parametroAlertaBusquedaSchema, 'params'), getAlertaBusquedaNovedad);

export default router;