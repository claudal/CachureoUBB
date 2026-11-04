import { prisma } from "../config/prisma.js";

export async function listar(filtros={}){
    /**@type {import("@prisma/client").Prisma.ObjetoPerdidoWhereInput} */
    const where = {};
    if(filtros.idOficina)
        where.idOficina = filtros.idOficina;
    if(filtros.idEstado)
        where.idEstado = filtros.idEstado;
    if(filtros.valioso)
        where.valioso = filtros.valioso;
    if(filtros.etiquetaObjeto)
        where.etiquetas = {
            some: {
                idEtiqueta: {
                    in: filtros.etiquetaObjeto
                }
            }
        }
    if(filtros.nombre)
        where.nombre = {
            mode: "insensitive",
            contains: filtros.nombre
        }
    if(filtros.palabrasClave) {
        const palabras = filtros.palabrasClave.trim().split(/\s+/);
        where.OR = palabras.map((palabra)=>({
            descripcion: {
                contains: palabra,
                mode: 'insensitive'
            }
        }))
    }
    if(filtros.fechaIngreso) {
        const fecha = new Date(filtros.fechaIngreso);

        const finFecha = new Date(filtros.fechaIngreso);
        finFecha.setHours(fecha.getHours(fecha)+23);
        finFecha.setMinutes(fecha.getMinutes(fecha)+59);
        finFecha.setSeconds(fecha.getSeconds(fecha)+59);
        finFecha.setMilliseconds(fecha.getMilliseconds(fecha)+999);

        where.fechaIngreso = {
            gte: fecha,
            lte: finFecha
        }
    }
    const objetos = await prisma.objetoPerdido.findMany({
        where,
        include: {
            fotos: {include:{foto:true}},
            etiquetas: {include:{etiqueta:true}}
        },
        orderBy: {fechaIngreso:'desc'}});
    return objetos.map((objeto)=>{
        const { etiquetas, fotos, ...restoObjeto} = objeto;
        return {
            ...restoObjeto,
            etiquetas: etiquetas.map((e)=> e.etiqueta),
            fotos: fotos.map((e)=> e.foto)
        }
    });
}