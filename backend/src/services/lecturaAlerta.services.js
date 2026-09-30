import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {import("@prisma/client").Prisma.AlertaLeidaCreateInput} data 
 * @returns 
 */
export function crear(id_alerta,rut_encargado){
    return prisma.alertaLeida.create({data:{id_alerta,rut_encargado}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.AlertaLeidaCreateInput} data 
 * @returns 
 */
export function eliminar(id_alerta,rut_encargado){
    return prisma.alertaLeida.delete({where: {id_alerta_rut_encargado: {id_alerta,rut_encargado}}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.AlertaLeidaCreateInput} data 
 * @returns 
 */
export function buscar(id_alerta,rut_encargado){
    return prisma.alertaLeida.findUnique({where:{id_alerta_rut_encargado:{id_alerta,rut_encargado}}});
}