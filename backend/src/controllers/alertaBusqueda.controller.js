import * as services from "../services/alertaBusqueda.services.js";

export async function getAlertasBusqueda(req, res, next) {
    try { 
        res.json(await services.listar(req.vQuery));
    } catch (err) {
        next(err);
    }
}