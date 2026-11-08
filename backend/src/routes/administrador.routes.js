import { Router } from "express";
import { getContacto } from "../controllers/administrador.controller.js";

const router = Router();

router.get('/contacto', getContacto);

export default router;