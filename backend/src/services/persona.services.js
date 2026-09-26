import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {import("@prisma/client").Persona.rut} rut
 * @returns 
 */
export function buscarPorId(rut){
    return prisma.persona.findUnique({where:{rut: rut}});
}