import { prisma } from "../config/prisma.js";

export async function listarUsuario(rut_usuario,filtros = {},){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {
        rut_autor: rut_usuario
    };
    if(filtros.idEstado) where.idEstado = filtros.idEstado;
    return await prisma.alertaBusqueda.findMany({where,orderBy:{fecha_creacion:'desc'}});
}

export async function listarEncargado(rut_encargado,filtros = {},){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {};
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {};
    if(filtros.id_estado) where.id_estado = filtros.id_estado;
    if(filtros.rut_autor) where.rut_autor = filtros.rut_autor;
    if(filtros.marcado) 
        where.marcadores = {
            some: {
                rut_encargado
            }
        }
    include.lecturas = {
        where: {
            rut_encargado
        }
    }
    include.marcadores = {
        where: {
            rut_encargado
        }
    }
    const alertas = await prisma.alertaBusqueda.findMany({where,include,orderBy:{fecha_creacion:'desc'}});
    return alertas.map((alerta)=>{
        const { lecturas,marcadores, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: lecturas.length > 0,
            marcada: marcadores.length > 0
        }
    });
}

/**
 * 
 * @param {import("@prisma/client").AlertaBusqueda.idAlerta} idAlerta
 * @returns 
 */
export async function buscarPorIdEncargado(id_alerta,rut_encargado){
    const alerta = await prisma.alertaBusqueda.findUnique({
        where:{id: id_alerta},
        include: {
            fotos:{select: {id_foto: true}},
            marcadores: {where:{rut_encargado}},
            solicitudes: {where:{rut_encargado}},
            reuniones: {where:{rut_encargado}}
        }
    });
    const {marcadores, ...restoAlerta} = alerta;
    return {
        ...restoAlerta,
        marcada: marcadores.length > 0
    }
}

/**
 * 
 * @param {import("@prisma/client").AlertaBusqueda.id_alerta} id_alerta
 * @returns 
 */
export function buscarPorId(id_alerta){
    const alerta = prisma.alertaBusqueda.findUnique({
        where:{id: id_alerta},
        include: {fotos:{select: {id_foto: true}}}
    });
    return alerta;
}