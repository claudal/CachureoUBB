import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {string} rut
 * @param {import("@prisma/client").Prisma.EncargadoOficinaInclude} include
 * @returns 
 */
export function buscarPorCorreo(correo){
    return prisma.administrador.findUnique({where:{correo}});
}

/**
 * 
 * @param {string} rut
 * @param {import("@prisma/client").Prisma.EncargadoOficinaInclude} include
 * @returns 
 */
export function buscarContacto(){
    return prisma.administrador.findFirst({
        select: {
            correo: true
        }
    });
}