import { Router } from "express";
import { getAlertasBusqueda } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validador.middleware.js";
import { filtroAlertaBusquedaSchema } from "../schemas/alertaBusqueda.schema.js";

const router = Router();

router.get('/',validate(filtroAlertaBusquedaSchema, 'query'), getAlertasBusqueda);

export default router;