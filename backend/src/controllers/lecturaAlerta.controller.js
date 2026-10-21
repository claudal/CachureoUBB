import { buscarPorId } from "../services/alertaBusqueda.services.js";
import { buscar, crear } from "../services/lecturaAlerta.services.js";


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function postLecturaAlerta(req, res, next) {
    try { 
        if(!(await buscarPorId(req.params.id)))
            return res.status(404).json({"error":"La alerta no existe."});
        if(await buscar(req.params.id,req.user.rut))
            return res.status(201).json({"mensaje":"La alerta ya tiene registro de leida por el encargado."});
        res.status(201).json(await crear(req.params.id,req.user.rut));
    } catch (err) {
        next(err);
    }
}