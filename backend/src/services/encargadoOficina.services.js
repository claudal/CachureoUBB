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