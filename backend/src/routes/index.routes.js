import { Router } from "express";
import alertaBusquedaRoutes from "./alertaBusqueda.routes.js";

export const router = Router();

router.use("/alertasBusqueda",alertaBusquedaRoutes);