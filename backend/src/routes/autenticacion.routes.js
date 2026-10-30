import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginEncargadoOficinaSchema } from "../schemas/login.schema.js";
import { getPerfil, loginEncargadoOficina } from "../controllers/autenticacion.controller.js";
import { autenticacion } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/login/encargadoOficina/',validate(loginEncargadoOficinaSchema, 'body'), loginEncargadoOficina);
router.get('/perfil/',autenticacion,getPerfil)

export default router;