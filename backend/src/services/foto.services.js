import { prisma } from "../config/prisma.js";

export function crear(url){
    return prisma.foto.create({data:{url}});
}

/**
 * 
 * @param {import("@prisma/client").AlertaBusqueda.idAlerta} idAlerta
 * @returns 
 */
export function eliminar(id){
    return prisma.alertaBusqueda.delete({where:{id}});
}