import bcrypt from "bcrypt";
import { buscarPorId } from "./persona.services.js";
import jwt from "jsonwebtoken";

export async function login(rut,contrasena){
    const persona = await buscarPorId(rut);
    if(!persona) {
        const err = new Error('Persona no encontrada');
        err.statusCode = 404;
        throw err;
    }
    if(!(await bcrypt.compare(contrasena,persona.contrasena))) {
        const err = new Error('Contraseña incorrecta');
        err.statusCode = 401;
        throw err;
    }

    const payload = {rut: persona.rut, rol: persona.id_rol};
    return {
        persona: payload,
        token: jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '8h'})
    }
}