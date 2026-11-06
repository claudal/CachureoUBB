import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginAdministradorSchema, loginEncargadoOficinaSchema } from "../schemas/login.schema.js";
import { getPerfil, loginAdministrador, loginEncargadoOficina } from "../controllers/autenticacion.controller.js";
import { autenticacion } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/login/encargadoOficina/',validate(loginEncargadoOficinaSchema, 'body'), loginEncargadoOficina);
router.post('/login/administrador/',validate(loginAdministradorSchema, 'body'), loginAdministrador);
router.get('/perfil/',autenticacion,getPerfil)

export default router;