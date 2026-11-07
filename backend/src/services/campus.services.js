import { prisma } from "../config/prisma.js";

export async function listar(){
    return prisma.campus.findMany({orderBy:{id:"asc"}});
}

export async function listarOficinas(idCampus){
    return prisma.oficina.findMany({where:{idCampus},orderBy:{nombre:"asc"}});
}