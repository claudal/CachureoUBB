import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/login.schema.js";
import { login } from "../controllers/autenticacion.controller.js";

const router = Router();

router.post('/login/',validate(loginSchema, 'body'), login);

export default router;