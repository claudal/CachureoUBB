import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function listar(){
    return prisma.campus.findMany({orderBy:{id:"asc"}});
}

export async function listarOficinas(idCampus){
    return prisma.oficina.findMany({where:{idCampus},orderBy:{nombre:"asc"}});
}

/**
 * @param {{nombre: string, direccion: string}} datos
 */
export async function crear({nombre, direccion}){
    return prisma.campus.create({data:{nombre, direccion}});
}

/**
 * Edita el nombre y la direccion de la sede. Si no existe, prisma lanza P2025 (404).
 *
 * @param {number} id
 * @param {{nombre: string, direccion: string}} datos
 */
export async function editar(id, {nombre, direccion}){
    return prisma.campus.update({where:{id}, data:{nombre, direccion}});
}

/**
 * Elimina la sede solo si no tiene oficinas asociadas.
 * Si existen, lanza un 409 informando el motivo del rechazo.
 *
 * @param {number} id
 */
export async function eliminar(id){
    const cantidadOficinas = await prisma.oficina.count({where:{idCampus:id}});
    if(cantidadOficinas > 0){
        const err = new Error(
            `No se puede eliminar la sede porque tiene ${cantidadOficinas} ${cantidadOficinas === 1 ? "oficina asociada" : "oficinas asociadas"}. Elimine o reasigne las oficinas primero`
        );
        err.statusCode = 409;
        throw err;
    }
    try {
        return await prisma.campus.delete({where:{id}});
    } catch (error) {
        // P2003: otra tabla (alertas de busqueda) sigue apuntando a la sede
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003"){
            const err = new Error("No se puede eliminar la sede porque tiene alertas de búsqueda asociadas");
            err.statusCode = 409;
            throw err;
        }
        throw error;
    }
}
