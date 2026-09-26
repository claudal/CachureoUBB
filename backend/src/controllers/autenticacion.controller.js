import * as services from "../services/autenticacion.services.js";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function login(req, res, next) {
    try {
        res.status(200).json(await services.login(req.body.rut,req.body.contrasena));
    } catch (err) {
        if(err.statusCode){
            return res.status(err.statusCode).json({ error: err.message})
        } else
            next(err);
    }
}