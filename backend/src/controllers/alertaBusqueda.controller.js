import * as services from "../services/alertaBusqueda.services.js";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function getAlertasBusqueda(req, res, next) {
    try {
        return res.json(await services.listarEncargado(req.user.rut,req.user.idCampus, req.vQuery));
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