import { Router } from "express";
import { getContacto } from "../controllers/administrador.controller.js";
import { getAlertasCerradas } from "../controllers/alertaBusqueda.controller.js";
import { autenticacion } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/contacto', getContacto);
// auditoria: alertas eliminadas por sus creadores, con el motivo
router.get('/alertasCerradas', autenticacion("administrador"), getAlertasCerradas);

export default router;
