import bcrypt from "bcrypt";
import { buscarPorId } from "./persona.services.js";
import jwt from "jsonwebtoken";

export async function login(rut,contrasena){
    const usuario = await buscarPorId(rut);
    if(!usuario) {
        const err = new Error('Usuario no encontrado');
        err.statusCode = 404;
        throw err;
    }
    if(!(await bcrypt.compare(contrasena,usuario.contrasena))) {
        const err = new Error('Contraseña incorrecta');
        err.statusCode = 401;
        throw err;
    }

    const payload = {rut: usuario.rut, rol: usuario.id_rol};
    return {
        usuario: payload,
        token: jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '8h'})
    }
}