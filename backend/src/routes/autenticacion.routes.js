import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginAdministradorSchema, loginEncargadoOficinaSchema, restablecerClaveSchema } from "../schemas/autenticacion.schema.js";
import { getPerfil, loginAdministrador, loginEncargadoOficina, postRestablecerClave } from "../controllers/autenticacion.controller.js";
import { autenticacion } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/login/encargadoOficina/',validate(loginEncargadoOficinaSchema, 'body'), loginEncargadoOficina);
router.post('/login/administrador/',validate(loginAdministradorSchema, 'body'), loginAdministrador);

router.post('/restablecerClave',
    validate(restablecerClaveSchema, 'body'),
    postRestablecerClave);

router.get('/perfil/',autenticacion("todos"),getPerfil)

export default router;