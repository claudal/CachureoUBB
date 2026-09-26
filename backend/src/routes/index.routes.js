import { Router } from "express";
import alertaBusquedaRoutes from "./alertaBusqueda.routes.js";
import autenticacionRoutes from "./autenticacion.routes.js";

export const router = Router();

router.use("/alertasBusqueda",alertaBusquedaRoutes);
router.use("/autenticacion",autenticacionRoutes);