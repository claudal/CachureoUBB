import { prisma } from "../config/prisma.js";
import { ESTADO_OBJETO } from "../config/estados.js";
import { eliminarArchivoFisico } from "./foto.services.js";
import { calcularRangoDia } from "../utils/fecha.utils.js";
import { INCLUDE_ENTREGA } from "./entrega.services.js";

/**@type {import("@prisma/client").Prisma.ObjetoPerdidoInclude}*/
const INCLUDE_DEFAULT = {
    estado: true,
    etiquetas: { include: { etiqueta: true } },
    fotos: { include: { foto: true }, orderBy: { foto: { id: 'asc' } } },
    entregas: { include: INCLUDE_ENTREGA, orderBy: { fechaEntrega: 'desc' } }
};

// deja etiquetas y fotos como listas simples, igual que en las alertas,
// y la entrega más reciente como "entrega" (null si no se ha entregado)
function formatear(objeto) {
    const { etiquetas, fotos, entregas, ...restoObjeto } = objeto;
    const formateado = {
        ...restoObjeto,
        etiquetas: etiquetas.map((e) => e.etiqueta),
        fotos: fotos.map((e) => e.foto)
    };
    if (entregas)
        formateado.entrega = entregas[0] ?? null;
    return formateado;
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
        include: INCLUDE_DEFAULT
    });
    return formatear(objeto);
}


/**
 * Actualiza un objeto perdido.
 * Elimina las fotos removidas de la BD y del servidor, y agrega las nuevas.
 *
 * @param {number} id
 * @param {{
 *   nombre: string, 
 *   descripcion: string, 
 *   idsEtiquetas: number[], 
 *   urlsFotosNuevas: string[], 
 *   idsFotosAConservar: number[] 
 * }} datos
 */
export async function actualizar(id, { nombre, descripcion, idsEtiquetas, urlsFotosNuevas = [], idsFotosAConservar = [] }) {
    // 1. Validar existencia de las etiquetas
    const etiquetas = await prisma.etiquetaObjeto.findMany({ 
        where: { id: { in: idsEtiquetas } } 
    });
    if (etiquetas.length !== idsEtiquetas.length) {
        const err = new Error("Una o más etiquetas seleccionadas no existen");
        err.statusCode = 400;
        throw err;
    }

    // 2. Obtener la relación actual de fotos del objeto en la BD
    const fotosAEliminar = await prisma.fotoObjeto.findMany({
        where: { 
            idObjeto: id,
            idFoto: { notIn: idsFotosAConservar }
        },
        include: { foto: true }
    });

    // 3. Eliminar los archivos físicos del servidor/disco de las fotos descartadas
    for (const f of fotosAEliminar) {
        await eliminarArchivoFisico(f.foto.url);
    }

    const idsFotosBorrar = fotosAEliminar.map((f) => f.idFoto);

    // 4. Actualización en la Base de Datos dentro de una Transacción
    const objetoActualizado = await prisma.$transaction(async (tx) => {
        // A. Reemplazar relación de Etiquetas (Eliminar viejas y asociar nuevas)
        await tx.objetoTieneEtiqueta.deleteMany({
            where: { idObjeto: id }
        });

        if (idsFotosBorrar.length > 0) {
            await tx.foto.deleteMany({
                where: { id: { in: idsFotosBorrar } }
            });
        }

        // C. Actualizar objeto y crear las referencias a las fotos nuevas
        return await tx.objetoPerdido.update({
            where: { id },
            data: {
                nombre,
                descripcion,
                etiquetas: {
                    create: idsEtiquetas.map((idEtiqueta) => ({ idEtiqueta }))
                },
                fotos: {
                    create: urlsFotosNuevas.map((url) => ({
                        foto: { create: { url } }
                    }))
                }
            },
            include: INCLUDE_DEFAULT
        });
    });

    return formatear(objetoActualizado);
}

export async function eliminar(id) {
    // 1. Obtener las fotos asociadas al objeto para eliminar los archivos físicos
    const fotosAEliminar = await prisma.fotoObjeto.findMany({
        where: { idObjeto: id },
        include: { foto: true }
    });
    // 2. Eliminar los archivos físicos del servidor/disco de las fotos descartadas
    for (const f of fotosAEliminar) {
        await eliminarArchivoFisico(f.foto.url);
    }
    // 3. Eliminar las fotos de la base de datos
    await prisma.fotoObjeto.deleteMany({
        where: { idObjeto: id }
    });
    // 4. Eliminar el objeto de la base de datos
    return await prisma.objetoPerdido.delete({
        where: { id }
    });
}

export async function listar(filtros={}) {
    /**@type {import("@prisma/client").Prisma.ObjetoPerdidoWhereInput} */
    const where = {};

    if(filtros.idOficina)
        where.idOficina = filtros.idOficina;
    if(filtros.idEstado) {
        where.idEstado = filtros.idEstado;
        if(filtros.idEstado === ESTADO_OBJETO.ENTREGADO) {
            if(filtros.fechaEntrega) {
                const fechas = calcularRangoDia(filtros.fechaEntrega);
                where.entregas = {
                    some: {
                        fechaEntrega: {
                            gte: fechas.inicioFecha,
                            lte: fechas.finFecha
                        }
                    }
                }
            }
        }
    }
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
        const fechas = calcularRangoDia(filtros.fechaIngreso);
        where.fechaIngreso = {
            gte: fechas.inicioFecha,
            lte: fechas.finFecha
        }
    }

    const objetos = await prisma.objetoPerdido.findMany({
        where,
        include: INCLUDE_DEFAULT,
        orderBy: {fechaIngreso:'desc'}});
    return objetos.map((objeto)=>formatear(objeto));
}

export async function listarPublico(filtros={}) {
    /**@type {import("@prisma/client").Prisma.ObjetoPerdidoWhereInput} */
    const where = {
        idEstado: 1,
        valioso: false,
    };
    
    const skip = filtros.salto;
    const take = filtros.cantidad;

    if(filtros.idCampus) where.oficina = {
        idCampus: filtros.idCampus
    }
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

    const objetos = await prisma.objetoPerdido.findMany({
        where,
        include: {
            fotos: {include:{foto:true}},
            etiquetas: {include:{etiqueta:true}},
            oficina: {
                include: {
                    campus: true,
                    fotos: {include: {foto:true}}
                },
            }
        },
        skip,
        take,
        orderBy: {fechaIngreso:'desc'}});
    return objetos.map((objeto)=>{
        const {oficina, ...o} = formatear(objeto);
        const {fotos, ...restoOficina} = oficina;
        return {
            ...o,
            oficina: {
                ...restoOficina,
                fotos: fotos.map((f)=>f.foto)
            } 
        };
    });
}

export async function buscarPorId(id){
    const objeto = await prisma.objetoPerdido.findUniqueOrThrow({
        where: {
            id: id
        },
        include: INCLUDE_DEFAULT
    });
    return formatear(objeto);
}