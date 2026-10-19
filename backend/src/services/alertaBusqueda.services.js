import { prisma } from "../config/prisma.js";

export async function listar(filtros = {}, usuario = undefined){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {};
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {};
    if(filtros.idEstado) where.idEstado = filtros.idEstado;
    if(usuario?.rol == 2) {
        if(filtros.marcado) 
            where.marcadores = {
                some: {
                    rutEncargado: usuario.rut
                }
            }
        include.alertasLeidas = {
            where: {
                rutEncargado: usuario.rut
            }
        }
        include.marcadores = {
            where: {
                rutEncargado: usuario.rut
            }
        }
    }
    const alertas = await prisma.alertaBusqueda.findMany({where, include, orderBy: {fechaEdicion:'desc'}});
    if(usuario?.rol != 2)
        return alertas;
    return alertas.map((alerta)=>{
        const { alertasLeidas, marcadores, ...restoAlerta } = alerta;
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
export function buscarPorId(idAlerta){
    return prisma.alertaBusqueda.findUnique({where:{id: idAlerta}});
}