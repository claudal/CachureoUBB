import { Router } from "express";
import { getAlertaBusqueda, getAlertasBusqueda } from "../controllers/alertaBusqueda.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { filtroAlertaBusquedaSchema, parametroAlertaBusquedaSchema } from "../schemas/alertaBusqueda.schema.js";
import { autenticacion } from "../middlewares/auth.middleware.js";
import { deleteMarcadorAlerta, postMarcadorAlerta } from "../controllers/marcadorAlerta.controller.js";
import { postLecturaAlerta } from "../controllers/lecturaAlerta.controller.js";

const router = Router();

router.use(autenticacion);

export default router;