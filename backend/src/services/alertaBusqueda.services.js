import { prisma } from "../config/prisma.js";

export async function listar(filtros = {},usuario = undefined){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {};
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {};
    if(filtros.id_estado) where.id_estado = filtros.id_estado;
    if(filtros.rut_autor) where.rut_autor = filtros.rut_autor;
    if(usuario?.rol == 2) {
        if(filtros.marcado) 
            where.marcadores = {
                some: {
                    rut_encargado: usuario.rut
                }
            }
        include.lecturas = {
            where: {
                rut_encargado: usuario.rut
            }
        }
    }
    const alertas = await prisma.alertaBusqueda.findMany({where,include,orderBy:{fecha_creacion:'desc'}});
    if(!usuario?.rol == 2)
        return alertas;
    return alertas.map((alerta)=>{
        const { lecturas, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: lecturas.length > 0
        }
    });
}

/**
 * 
 * @param {import("@prisma/client").AlertaBusqueda.id_alerta} id_alerta
 * @returns 
 */
export function buscarPorId(id_alerta){
    return prisma.alertaBusqueda.findUnique({where:{id: id_alerta}});
}