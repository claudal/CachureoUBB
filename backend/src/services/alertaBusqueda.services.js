import { prisma } from "../config/prisma.js";

export async function listarEncargado(rutEncargado,idCampus,filtros = {},){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {
        idCampus
    };
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {};
    if(filtros.idEstado) where.idEstado = filtros.idEstado;
    if(filtros.marcado) 
        where.marcadores = {
            some: {
                rutEncargado
            }
        }
    include.alertasLeidas = {
        where: {
            rutEncargado
        }
    }
    include.marcadores = {
        where: {
            rutEncargado
        }
    }
    const alertas = await prisma.alertaBusqueda.findMany({where,include,orderBy:{fechaEdicion:'desc'}});
    return alertas.map((alerta)=>{
        const { alertasLeidas,marcadores, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: alertasLeidas.length > 0,
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
        include: {fotos:{select: {idFoto: true}}}
    });
    return alerta;
}