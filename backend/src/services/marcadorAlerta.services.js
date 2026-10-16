import { prisma } from "../config/prisma.js";

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function crear(idAlerta,rutEncargado){
    return prisma.marcadorEncargado.create({data:{idAlerta,rutEncargado}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function eliminar(idAlerta,rutEncargado){
    return prisma.marcadorEncargado.delete({where: {idAlerta_rutEncargado: {idAlerta,rutEncargado}}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function buscar(idAlerta,rutEncargado){
    return prisma.marcadorEncargado.findUnique({where:{idAlerta_rutEncargado:{idAlerta,rutEncargado}}});
}