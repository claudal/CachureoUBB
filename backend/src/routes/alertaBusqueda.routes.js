import { Router } from "express";
import { getAlertasBusqueda } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { filtroAlertaBusquedaSchema } from "../schemas/alertaBusqueda.schema.js";
import { autenticacion } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(autenticacion);

router.get('/',validate(filtroAlertaBusquedaSchema, 'query', 'vQuery'), getAlertasBusqueda);

export default router;