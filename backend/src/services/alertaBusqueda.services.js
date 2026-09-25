import { prisma } from "../config/prisma.js";

export function listar(filtros = {}){
    const where = {};
    return prisma.alertaBusqueda.findMany({where});
}