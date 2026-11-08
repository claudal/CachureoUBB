import bcrypt from "bcrypt";
import { buscarPorRut } from "./encargadoOficina.services.js";
import jwt from "jsonwebtoken";
import { buscarPorCorreo } from "./administrador.services.js";
import { PASSWORD_RESET_TIME, PASSWORD_SET_TIME, SESSION_EXPIRATION_TIME } from "../config/auth.js";



export async function loginEncargadoOficina(rut,clave){
    const usuario = await buscarPorRut(rut,{oficina:true});
    if(!usuario) {
        const err = new Error('RUT o contraseña incorrectos');
        err.statusCode = 401;
        throw err;
    }
    if(usuario.idEstado !== 1) { //estado habilitado
        const err = new Error('Usuario no habilitado para inicio de sesión');
        err.statusCode = 403;
        throw err;
    }
    if(!(await bcrypt.compare(clave,usuario.clave))) {
        const err = new Error('RUT o contraseña incorrectos');
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
        // idOficina e idCampus van en el token porque los controladores los leen desde req.user
        token: jwt.sign(
            {rut: payload.rut, idOficina: payload.idOficina, idCampus: payload.idCampus},
            process.env.JWT_SECRET,
            {expiresIn: SESSION_EXPIRATION_TIME}
        )
    }
}

export async function loginAdministrador(correo,clave){
    const usuario = await buscarPorCorreo(correo);
    if(!usuario || !(await bcrypt.compare(clave,usuario.clave))) {
        const err = new Error('Correo o contraseña incorrectos');
        err.statusCode = 401;
        throw err;
    }
    const payload = {
        correo: usuario.correo
    }
    return {
        usuario: payload,
        // idOficina e idCampus van en el token porque los controladores los leen desde req.user
        token: jwt.sign(
            payload,
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

export async function getPerfilAdministrador(email) {
    const {clave, ...administrador} = await buscarPorCorreo(email);
    if(!administrador) {
        const err = new Error('El usuario de la sesión ya no existe');
        err.statusCode = 404;
        throw err;
    }
    return administrador;
}

function generarTokenEncargado(rut, tipo, expiresIn) {
  return jwt.sign(
    {
      rut,
      tipo,     // 'creacion' | 'restablecimiento'
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

export function crearTokenCreacionClaveEncargado(rut) {
  return generarTokenEncargado(rut, 'creacion', PASSWORD_SET_TIME);
}