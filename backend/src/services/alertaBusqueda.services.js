import { prisma } from "../config/prisma.js";

export async function listarEncargado(rutEncargado,idCampus,filtros = {},){
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {
        idCampus
    };
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {
        etiquetas: {
            include:{etiqueta:{omit:{valioso:true}}}
        }
    };
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
    if(filtros.etiquetaObjeto) where.etiquetas = {
        some: {
            idEtiqueta: {
                in: filtros.etiquetaObjeto
            }
        }
    }
    if(filtros.nombre) where.nombre = {
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
    const alertas = await prisma.alertaBusqueda.findMany({where,include,orderBy:{fechaEdicion:'desc'}});
    return alertas.map((alerta)=>{
        const { alertasLeidas,marcadores, etiquetas, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: alertasLeidas.length > 0,
            marcada: marcadores.length > 0,
            etiquetas: etiquetas.map((e)=> e.etiqueta)
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