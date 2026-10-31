import bcrypt from "bcrypt";
import { buscarPorRut } from "./encargadoOficina.services.js";
import jwt from "jsonwebtoken";

const SESSION_EXPIRATION_TIME = '1h';

export async function loginEncargadoOficina(rut,clave){
    const usuario = await buscarPorRut(rut,{oficina:true});
    if(!usuario) {
        const err = new Error('Persona no encontrada');
        err.statusCode = 404;
        throw err;
    }
    if(!(await bcrypt.compare(clave,usuario.clave))) {
        const err = new Error('Contraseña incorrecta');
        err.statusCode = 401;
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
        token: jwt.sign({rut: payload.rut},process.env.JWT_SECRET,{expiresIn: SESSION_EXPIRATION_TIME})
    }
}

export async function getPerfilEncargadoOficina(rut) {
    const encargado = await buscarPorRut(rut,{oficina: true});
    return {
        rut: encargado.rut,
        nombre: encargado.nombre,
        correoContacto: encargado.correoContacto,
        idOficina: encargado.idOficina,
        idCampus: encargado.oficina.idCampus
    }
}