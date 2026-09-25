import * as services from "../services/alertaBusqueda.services.js";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function getAlertasBusqueda(req, res, next) {
    try { 
        res.json(await services.listar(req.vQuery));
    } catch (err) {
        next(err);
    }
}