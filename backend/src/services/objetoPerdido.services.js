import { prisma } from "../config/prisma.js";
import { ESTADO_OBJETO } from "../config/estados.js";

/**@type {import("@prisma/client").Prisma.ObjetoPerdidoInclude}*/
const include = {
    estado: true,
    etiquetas: { include: { etiqueta: true } },
    fotos: { include: { foto: true } }
};

// deja etiquetas y fotos como listas simples, igual que en las alertas
function formatear(objeto) {
    const { etiquetas, fotos, ...restoObjeto } = objeto;
    return {
        ...restoObjeto,
        etiquetas: etiquetas.map((e) => e.etiqueta),
        fotos: fotos.map((e) => e.foto)
    };
}

/**
 * Registra un objeto perdido en la oficina indicada, con estado "Sin entrega".
 * Queda como valioso si el encargado lo marcó o si alguna etiqueta es valiosa.
 *
 * @param {{nombre: string, descripcion: string, idsEtiquetas: number[], valioso: boolean, urlsFotos: string[], idOficina: number}} datos
 */
export async function crear({ nombre, descripcion, idsEtiquetas, valioso, urlsFotos, idOficina }) {
    const etiquetas = await prisma.etiquetaObjeto.findMany({ where: { id: { in: idsEtiquetas } } });
    if (etiquetas.length !== idsEtiquetas.length) {
        const err = new Error("Una o más etiquetas seleccionadas no existen");
        err.statusCode = 400;
        throw err;
    }

    const objeto = await prisma.objetoPerdido.create({
        data: {
            nombre,
            descripcion,
            valioso: valioso || etiquetas.some((etiqueta) => etiqueta.valioso),
            idEstado: ESTADO_OBJETO.SIN_ENTREGA,
            idOficina,
            etiquetas: {
                create: idsEtiquetas.map((idEtiqueta) => ({ idEtiqueta }))
            },
            fotos: {
                create: urlsFotos.map((url) => ({ foto: { create: { url } } }))
            }
        },
        include
    });
    return formatear(objeto);
}

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
