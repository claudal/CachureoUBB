import bcrypt from "bcrypt";
import { buscarPorRut } from "./encargadoOficina.services.js";
import jwt from "jsonwebtoken";

const SESSION_EXPIRATION_TIME = '1h';

export async function loginEncargadoOficina(rut,clave){
    const usuario = await buscarPorRut(rut,{oficina:true});
    // mismo mensaje para rut inexistente y clave incorrecta, así no se puede averiguar qué ruts existen
    if(!usuario || !(await bcrypt.compare(clave,usuario.clave))) {
        const err = new Error('RUT o contraseña incorrectos');
        err.statusCode = 401;
        throw err;
    }
    if(!usuario.habilitado) {
        const err = new Error('El usuario se encuentra deshabilitado');
        err.statusCode = 403;
        throw err;
    }
    const payload = {
        rut: usuario.rut,
        nombre: usuario.nombre,
        correoContacto: usuario.correoContacto,
        idOficina: usuario.oficina.id,
        idCampus: usuario.oficina.idCampus
    }
    return {
        usuario: payload,
        // idOficina e idCampus van en el token porque los controladores los leen desde req.user
        token: jwt.sign(
            {rut: payload.rut, idOficina: payload.idOficina, idCampus: payload.idCampus},
            process.env.JWT_SECRET,
            {expiresIn: SESSION_EXPIRATION_TIME}
        )
    }
}

export async function getPerfilEncargadoOficina(rut) {
    const encargado = await buscarPorRut(rut,{oficina: true});
    if(!encargado) {
        const err = new Error('El usuario de la sesión ya no existe');
        err.statusCode = 404;
        throw err;
    }
    return {
        rut: encargado.rut,
        nombre: encargado.nombre,
        correoContacto: encargado.correoContacto,
        idOficina: encargado.idOficina,
        idCampus: encargado.oficina.idCampus
    }
}