import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {import("@prisma/client").EncargadoOficina.rut} rut
 * @returns 
 */
export function buscarPorId(rut){
    return prisma.encargadoOficina.findUnique({where:{rut: rut}});
}