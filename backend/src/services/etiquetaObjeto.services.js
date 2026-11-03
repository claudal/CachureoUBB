import { prisma } from "../config/prisma.js";

export function listar(filtros){
    if(filtros.valioso === undefined)
        return prisma.etiquetaObjeto.findMany();
    return prisma.etiquetaObjeto.findMany({where: {valioso: filtros.valioso}});
}