import { prisma } from "../config/prisma.js";
import { encriptarClave } from "../utils/autenticacion.utils.js";
import { crearTokenCreacionClaveEncargado } from "./autenticacion.services.js";
import { enviarCorreoCreacionEncargado } from "./email.services.js";

export function listar(filtros={}){
    return prisma.encargadoOficina.findMany({
        omit: {
            clave: true,
            fechaCambioClave: true,
        },
        include: {
            oficina: true,
            estado: true
        },
        skip: filtros.salto,
        take: filtros.cantidad,
        orderBy:{nombre:'asc'}
    })
}

/**
 * 
 * @param {string} rut
 * @param {import("@prisma/client").Prisma.EncargadoOficinaInclude} include
 * @returns 
 */
export function buscarPorRut(rut,include=undefined){
    return prisma.encargadoOficina.findUnique({where:{rut: rut},include});
}

/**
 * 
 * @param {import(import("@prisma/client").Prisma.EncargadoOficinaCreateInput)} data
 * @returns 
 */
export async function crear(data){
    const encargado = await prisma.encargadoOficina.create({
        data: {
            ...data,
            clave: "000000" //clave por defecto, no se puede iniciar sesión por estado "Pendiente"
        },
        omit: {
            clave: true
        }
    });
    const token = crearTokenCreacionClaveEncargado(encargado.rut);
    let correoEnviado;
    try {
        await enviarCorreoCreacionEncargado(encargado.correoContacto,encargado.nombre,token);
        correoEnviado = true;
    } catch(e) {
        correoEnviado = false;
        console.error(e);
    }
    return {encargado,correoEnviado};
}

export async function cambiarClave(rut, claveNueva){
    await prisma.encargadoOficina.update({
        where:{
            rut
        },
        data: {
            idEstado: 1,
            fechaCambioClave: new Date(),
            clave: {
                set: encriptarClave(claveNueva)
            }
        }
    });
}