import { prisma } from "../config/prisma.js";

export function listar(filtros = {}){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {};
    if(filtros.id_estado) where.id_estado = filtros.id_estado;
    if(filtros.rut_autor) where.rut_autor = filtros.rut_autor;
    if(filtros.rut_encargado) {
        if(filtros.marcado) 
            where.marcadores = {
                some: {
                    rut_encargado: filtros.rut_marcador
                }
            };
    }
    return prisma.alertaBusqueda.findMany({where,include});
}