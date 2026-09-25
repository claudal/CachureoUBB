import { prisma } from "../config/prisma.js";

export function listar(filtros = {}){
    const where = {};
    if(filtros.id_estado) where.id_estado = filtros.id_estado;
    if(filtros.rut_autor) where.rut_autor = filtros.rut_autor;
    return prisma.alertaBusqueda.findMany({where});
}