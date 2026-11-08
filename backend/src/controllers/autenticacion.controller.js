import * as services from "../services/autenticacion.services.js";
import { cambiarClave } from "../services/encargadoOficina.services.js";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function loginEncargadoOficina(req, res, next) {
    try {
        res.status(200).json(await services.loginEncargadoOficina(req.body.rut,req.body.clave));
    } catch (err) {
        if(err.statusCode){
            return res.status(err.statusCode).json({ error: err.message})
        } else
            next(err);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export async function loginAdministrador(req, res, next) {
    try {
        res.status(200).json(await services.loginAdministrador(req.body.correo,req.body.clave));
    } catch (err) {
        if(err.statusCode === 401)
            return res.status(err.statusCode).json({ error: err.message});
        next(err);
    }
}

export async function getPerfil(req,res, next){
    try {
        if(req.user.rut)
            return res.status(200).json(await services.getPerfilEncargadoOficina(req.user.rut));
        if(req.user.correo)
            res.status(200).json(await services.getPerfilAdministrador(req.user.correo))
    } catch (err) {
        if(err.statusCode){
            return res.status(err.statusCode).json({ error: err.message})
        } else
            next(err);
    }
}

export async function postRestablecerClave(req,res, next){
    try {
        const encargado = await services.verificarTokenCambioClaveEncargado(req.body.token)
        if(!encargado)
            return res.status(401).json({error: "Token inválido o expirado"});
        await cambiarClave(encargado.rut, req.body.claveNueva);
        res.status(201).json({"mensaje": "Constraseña reestablecida con éxito"});
    } catch (err) {
        if(err.statusCode){
            return res.status(err.statusCode).json({ error: err.message})
        } else
            next(err);
    }
}