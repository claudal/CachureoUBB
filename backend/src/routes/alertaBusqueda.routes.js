import { Router } from "express";
import { deleteAlertaBusqueda, getAlertaBusqueda, getAlertaBusquedaNovedad, getAlertasBusqueda, postAlertaBusqueda, postReunion, putAlertaBusqueda, postSolicitudDetalles } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { filtroAlertaBusquedaSchema, parametroAlertaBusquedaSchema, crearAlertaBusquedaSchema, actualizarAlertaBusquedaSchema, cerrarAlertaBusquedaSchema, crearSolicitudDetallesSchema, crearReunionSchema } from "../schemas/alertaBusqueda.schema.js";
import { autenticacion } from "../middlewares/auth.middleware.js";
import { ocultarAlertaCerrada } from "../middlewares/alertaCerrada.middleware.js";
import { deleteMarcadorAlerta, postMarcadorAlerta } from "../controllers/marcadorAlerta.controller.js";
import { postLecturaAlerta } from "../controllers/lecturaAlerta.controller.js";
import { subirFotos } from "../middlewares/upload.middleware.js";

const router = Router();

router.post('/', subirFotos, validate(crearAlertaBusquedaSchema), postAlertaBusqueda);

router.get('/',autenticacion("encargado"),validate(filtroAlertaBusquedaSchema, 'query', 'vQuery'), getAlertasBusqueda);
router.get('/:id/',validate(parametroAlertaBusquedaSchema, 'params'), ocultarAlertaCerrada, getAlertaBusqueda);
router.put('/:id/', validate(parametroAlertaBusquedaSchema, 'params'), subirFotos, validate(actualizarAlertaBusquedaSchema), putAlertaBusqueda);
router.delete('/:id/', validate(parametroAlertaBusquedaSchema, 'params'), validate(cerrarAlertaBusquedaSchema), deleteAlertaBusqueda);


router.post('/:id/marcadores/',autenticacion("encargado"),validate(parametroAlertaBusquedaSchema,'params'),ocultarAlertaCerrada,postMarcadorAlerta);
router.delete('/:id/marcadores/',autenticacion("encargado"),validate(parametroAlertaBusquedaSchema,'params'),deleteMarcadorAlerta);

router.post('/:id/lecturas/',autenticacion("encargado"),validate(parametroAlertaBusquedaSchema,'params'),ocultarAlertaCerrada,postLecturaAlerta);

router.post('/:id/solicitudesDetalles/',
    autenticacion("encargado"),
    validate(parametroAlertaBusquedaSchema,'params'),
    ocultarAlertaCerrada,
    validate(crearSolicitudDetallesSchema),
    postSolicitudDetalles);
router.post('/:id/reuniones/',
    autenticacion("todos"),
    validate(parametroAlertaBusquedaSchema,'params'),
    ocultarAlertaCerrada,
    validate(crearReunionSchema),
    postReunion);
router.get('/:id/solicitudesDetalles/novedad',validate(parametroAlertaBusquedaSchema, 'params'), getAlertaBusquedaNovedad);

export default router;