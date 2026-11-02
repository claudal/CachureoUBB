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
export async function getAlertaBusqueda(req, res, next) {
    try {
        if(req.user.rol == 2)
            return res.json(await services.buscarPorIdEncargado(req.params.id));
        const alerta = await services.buscarPorId(req.params.id);
        if(alerta.rut_autor !== req.user.rut)
            return res.status(403).json({"error": "La persona autenticada no puede acceder a la"})
        return alerta;
    } catch (err) {
        next(err);
    }
}