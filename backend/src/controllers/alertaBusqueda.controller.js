import * as services from "../services/alertaBusqueda.services.js";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function getAlertasBusqueda(req, res, next) {
    try {
        if(req.user.rol == 2)
            return res.json(await services.listarEncargado(req.user.rut, req.vQuery));
        res.json(await services.listarUsuario(req.user.rut, req.vQuery))
    } catch (err) {
        next(err);
    }
}