import { prisma } from "../config/prisma.js";

export async function listarEncargado(rutEncargado,idCampus,filtros = {},){
    // sin sede, Prisma ignoraría el filtro y devolvería alertas de todas las sedes
    if(idCampus == null)
        throw new Error("Se requiere la sede para listar alertas");
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {
        idCampus
    };
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaInclude}*/
    const include = {
        etiquetas: {
            include:{etiqueta:{omit:{valioso:true}}}
        },
        fotos: {
            include: {
                foto: true
            }
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
        const { alertasLeidas,marcadores, etiquetas, fotos, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: alertasLeidas.length > 0,
            marcada: marcadores.length > 0,
            etiquetas: etiquetas.map((e)=> e.etiqueta),
            fotos: fotos.map((e)=> e.foto)
        }
    });
}

/**
 * Crea una alerta de búsqueda en el campus ingresado, con estado "Sin entrega".
 * Queda como valioso si el encargado lo marcó o si alguna etiqueta es valiosa.
 *
 * @param {{nombre: string, descripcion: string, idsEtiquetas: number[], urlsFotos: string[], idCampus: number}} datos
 */
export async function crear({ nombre, descripcion, idsEtiquetas, urlsFotos, idCampus }) {
    const etiquetas = idsEtiquetas ? await prisma.etiquetaObjeto.findMany({ where: { id: { in: idsEtiquetas } } }) : [];
    if (etiquetas.length !== idsEtiquetas.length) {
        const err = new Error("Una o más etiquetas seleccionadas no existen");
        err.statusCode = 400;
        throw err;
    }

    const alerta = await prisma.alertaBusqueda.create({
        data: {
            nombre,
            descripcion,
            idEstado: 1,
            idCampus,
            etiquetas: etiquetas && {
                create: idsEtiquetas.map((idEtiqueta) => ({ idEtiqueta }))
            },
            fotos: urlsFotos && {
                create: urlsFotos.map((url) => ({ foto: { create: { url } } }))
            }
        }
    });
    return {idAlerta: alerta.id};
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
export async function buscarPorId(id_alerta){
    const {fotos,etiquetas,reuniones,...alerta} = await prisma.alertaBusqueda.findUniqueOrThrow({
        where:{id: id_alerta},
        include: {
            solicitudesDetalles: {
                select:{
                    fechaCreacion:true,
                    indicaciones:true
                }
            },
            reuniones: {select:{fechaCreacion:true,indicaciones:true,oficina:{include:{fotos:{include:{foto:true}}}}}},
            etiquetas: {select:{etiqueta: true}},
            campus: true,
            fotos:{select: {foto:true}}
        }
    });
    return {
        ...alerta,
        fotos: fotos.map((f)=>f.foto),
        etiquetas: etiquetas.map((e)=>e.etiqueta),
        reuniones: reuniones.map(({oficina,...r})=>{
            const {fotos,...o} = oficina;
            return {
                ...r,
                oficina: {
                    ...o,
                    fotos: fotos.map((f)=>f.foto)
                }
            }
        })
    };
}

export function crearSolicitud(idAlerta,rutEncargado,datos){
    return prisma.solicitudDetalles.create({
        data: {
            idAlerta,
            rutEncargado,
            indicaciones: datos.indicaciones
        }
    })
}

export function crearReunion(idAlerta,rutEncargado,idOficina,datos){
    return prisma.reunion.create({
        data: {
            idAlerta,
            rutEncargado,
            idOficina,
            indicaciones: datos.indicaciones
        }
    })
}

export async function buscarNovedad(idAlerta){
    const solicitudes = await prisma.solicitudDetalles.count(
        {
            where: {idAlerta}
        }
    )
    const reuniones = await prisma.reunion.count(
        {
            where: {idAlerta}
        }
    )
    return solicitudes > 0 || reuniones > 0;
}