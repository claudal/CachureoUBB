import { Router } from "express";
import { getAlertasBusqueda } from "../controllers/alertaBusqueda.controller.js";

const router = Router();

router.get('/',getAlertasBusqueda);

export default router;