import { prisma } from "../config/prisma.js";

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
    const {clave, ...encargado} = prisma.encargadoOficina.create({
        data: {
            ...data,
            clave: generarClaveDefecto(data.rut)
        }
    });
    return encargado;
}

function generarClaveDefecto(rut){
    return rut.substring(2,8);
}