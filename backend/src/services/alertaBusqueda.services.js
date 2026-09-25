import { prisma } from "../config/prisma.js";

export function listar(filtros = {}){
    const where = {};
    if(filtros.id_estado) where.id_estado = filtros.id_estado;
    return prisma.alertaBusqueda.findMany({where});
}