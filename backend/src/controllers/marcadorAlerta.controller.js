import { buscarPorId } from "../services/alertaBusqueda.services.js";
import { buscar, crear, eliminar } from "../services/marcadorAlerta.services.js";


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function postMarcadorAlerta(req, res, next) {
    try { 
        if(!(await buscarPorId(req.params.id)))
            return res.status(404).json({"error":"La alerta a marcar no existe."});
        if(req.user.rol !== 2)
            return res.status(403).json({"error":"La persona que marca una alerta debe ser un encargado."});
        if(await buscar(req.params.id,req.user.rut))
            return res.status(409).json({"error":"La alerta ya fue agregada en los marcadores."});
        res.status(201).json(await crear(req.params.id,req.user.rut));
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
export async function deleteMarcadorAlerta(req, res, next) {
    try { 
        if(!(await buscarPorId(req.params.id)))
            return res.status(404).json({"error":"La alerta a marcar no existe."});
        if(req.user.rol !== 2)
            return res.status(403).json({"error":"La persona que marca una alerta debe ser un encargado."});
        if(!(await buscar(req.params.id,req.user.rut)))
            return res.status(404).json({"error":"La alerta no se encuentra en los marcadores."});
        await eliminar(req.params.id,req.user.rut);
        res.status(200).json({"mensaje": "Marcador eliminado con éxito."});
    } catch (err) {
        next(err);
    }
}