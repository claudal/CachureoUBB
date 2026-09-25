import { prisma } from "../config/prisma.js";

export async function listar(filtros = {}){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {};
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {};
    if(filtros.id_estado) where.id_estado = filtros.id_estado;
    if(filtros.rut_autor) where.rut_autor = filtros.rut_autor;
    if(filtros.rut_encargado) {
        if(filtros.marcado) 
            where.marcadores = {
                some: {
                    rut_encargado: filtros.rut_encargado
                }
            }
        include.lecturas = {
            where: {
                rut_encargado: filtros.rut_encargado
            }
        }
    }
    const alertas = await prisma.alertaBusqueda.findMany({where,include,orderBy:{fecha_creacion:'desc'}});
    if(!filtros.rut_encargado)
        return alertas;
    return alertas.map((alerta)=>{
        const { lecturas, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: lecturas.length > 0
        }
    });
}