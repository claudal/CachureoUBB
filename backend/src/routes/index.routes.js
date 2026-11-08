import { Router } from "express";
import alertaBusquedaRoutes from "./alertaBusqueda.routes.js";
import autenticacionRoutes from "./autenticacion.routes.js";
import objetoPerdidoRoutes from "./objetoPerdido.routes.js";
import encargadoOficinaRoutes from "./encargadoOficina.routes.js";
import etiquetaObjetoRoutes from "./etiquetaObjeto.routes.js";
import campusRoutes from "./campus.routes.js";
import administradorRoutes from "./administrador.routes.js";

export const router = Router();

router.use("/administrador", administradorRoutes);
router.use("/alertasBusqueda", alertaBusquedaRoutes);
router.use("/autenticacion", autenticacionRoutes);
router.use("/objetoPerdido", objetoPerdidoRoutes);
router.use("/encargadoOficina", encargadoOficinaRoutes);
router.use("/etiquetaObjeto", etiquetaObjetoRoutes);
router.use("/campus", campusRoutes);