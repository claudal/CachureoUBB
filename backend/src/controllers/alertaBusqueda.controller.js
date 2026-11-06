import * as services from "../services/alertaBusqueda.services.js";
import { buscarPorRut } from "../services/encargadoOficina.services.js";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function getAlertasBusqueda(req, res, next) {
    try {
        // la sede se obtiene de la oficina actual del encargado y no del token,
        // asi un cambio de oficina de encargado se refleja de inmediato
        const encargado = await buscarPorRut(req.user.rut, {oficina: true});
        if(!encargado)
            return res.status(401).json({"error": "El usuario de la sesión ya no existe"});
        return res.json(await services.listarEncargado(encargado.rut, encargado.oficina.idCampus, req.vQuery));
    } catch (err) {
        next(err);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function postSolicitudDetalles(req, res, next) {
    try {
        const encargado = await buscarPorRut(req.user.rut, {oficina: true});
        if(!encargado)
            return res.status(401).json({"error": "El usuario de la sesión ya no existe"});
        const alerta = await prisma.alertaBusqueda.findUniqueOrThrow({where:{id: req.params.id}});
        if(alerta.idCampus !== encargado.oficina.idCampus){
            return res.status(403).json({"error": "No tiene permisos para enviar una solicitud a esta alerta"})
        } 
        return res.json(await services.crearSolicitud(req.params.id, encargado.rut, req.body));
    } catch (err) {
        next(err);
    }
}


/**
 * Registra una alerta de búsqueda.
 * Espera multipart/form-data con nombre, descripcion, etiquetas[], idCampus y fotos[].
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function postAlertaBusqueda(req, res, next) {
  try {

    const idAlerta = await services.crear({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      idsEtiquetas: req.body.etiquetas,
      urlsFotos: req.files?.map((archivo) => archivo.filename) || [],
      idCampus: req.body.idCampus
    });
    res.status(201).json(idAlerta);
  } catch (err) {
    if (err.statusCode)
      return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function getAlertaBusqueda(req, res, next) {
    try {
        return res.status(200).json(await services.buscarPorId(req.params.id));
    } catch (err) {
        next(err);
    }
}