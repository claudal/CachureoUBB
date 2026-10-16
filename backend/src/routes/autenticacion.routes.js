import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginEncargadoOficinaSchema } from "../schemas/login.schema.js";
import { loginEncargadoOficina } from "../controllers/autenticacion.controller.js";

const router = Router();

router.post('/login/encargadoOficina/',validate(loginEncargadoOficinaSchema, 'body'), loginEncargadoOficina);

export default router;