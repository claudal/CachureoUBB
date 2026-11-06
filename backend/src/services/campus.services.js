import { prisma } from "../config/prisma.js";

export async function listar(){
    return prisma.campus.findMany({orderBy:{id:"asc"}});
}