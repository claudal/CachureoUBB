import bcrypt from "bcrypt";
import { buscarPorId } from "./encargadoOficina.services.js";
import jwt from "jsonwebtoken";

export async function loginEncargadoOficina(rut,clave){
    const usuario = await buscarPorId(rut,{oficina:true});
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
        idOficina: usuario.oficina.id,
        idCampus: usuario.oficina.idCampus
    }
    return {
        usuario: payload,
        token: jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '8h'})
    }
}