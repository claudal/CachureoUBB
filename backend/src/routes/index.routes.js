import { Router } from "express";
import alertaBusquedaRoutes from "./alertaBusqueda.routes.js";
import autenticacionRoutes from "./autenticacion.routes.js";
import objetoPerdidoRoutes from "./objetoPerdido.routes.js";
import personaRoutes from "./persona.routes.js";

export const router = Router();

router.use("/alertasBusqueda", alertaBusquedaRoutes);
router.use("/autenticacion", autenticacionRoutes);
router.use("/objetos", objetoPerdidoRoutes);
router.use("/personas", personaRoutes);