import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {import("@prisma/client").Prisma.AlertaLeidaCreateInput} data 
 * @returns 
 */
export function crear(idAlerta,rutEncargado){
    return prisma.alertaLeida.create({data:{idAlerta,rutEncargado}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.AlertaLeidaCreateInput} data 
 * @returns 
 */
export function eliminar(idAlerta,rutEncargado){
    return prisma.alertaLeida.delete({where: {idAlerta_rutEncargado: {idAlerta,rutEncargado}}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.AlertaLeidaCreateInput} data 
 * @returns 
 */
export function buscar(idAlerta,rutEncargado){
    return prisma.alertaLeida.findUnique({where:{idAlerta_rutEncargado:{idAlerta,rutEncargado}}});
}