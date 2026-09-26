import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function crear(id_alerta,rut_encargado){
    return prisma.marcadorEncargado.create({data:{id_alerta,rut_encargado}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function eliminar(id_alerta,rut_encargado){
    return prisma.marcadorEncargado.delete({where: {id_alerta_rut_encargado: {id_alerta,rut_encargado}}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function buscar(id_alerta,rut_encargado){
    return prisma.marcadorEncargado.findUnique({where:{id_alerta_rut_encargado:{id_alerta,rut_encargado}}});
}