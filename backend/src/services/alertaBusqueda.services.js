import { prisma } from "../config/prisma.js";
import { ESTADO_ALERTA } from "../config/estados.js";
import { MAXIMO_FOTOS } from "../config/upload.js";
import { DIAS_AVISO_VENCIMIENTO, DIAS_VENCIMIENTO, MS_POR_DIA } from "../config/caducidad.js";

export async function listarEncargado(rutEncargado,idCampus,filtros = {},){
    // sin sede, Prisma ignoraría el filtro y devolvería alertas de todas las sedes
    if(idCampus == null)
        throw new Error("Se requiere la sede para listar alertas");
    /**@type {import("@prisma/client").Prisma.AlertaBusquedaWhereInput}*/
    const where = {
        idCampus,
        // las alertas cerradas dejan de mostrarse a los encargados (solo las ve el administrador).
        // Las vencidas tampoco: quedan a la espera de que su creador las reabra o elimine.
        // Va en AND para que el filtro opcional por idEstado no lo pise
        AND: { idEstado: { notIn: [ESTADO_ALERTA.CERRADO, ESTADO_ALERTA.VENCIDO] } }
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
    include.reuniones = {
        where: {
            rutEncargado
        }
    }
    include.solicitudesDetalles = {
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
        const { alertasLeidas,marcadores, etiquetas, fotos, solicitudesDetalles, reuniones, ...restoAlerta} = alerta;
        return {
            ...restoAlerta,
            leida: alertasLeidas.length > 0,
            marcada: marcadores.length > 0,
            // el encargado solo puede marcar una alerta tras abrirla (queda leida), y el unico
            // evento que borra esa lectura es la edicion del buscador (ver actualizar)
            modificada: marcadores.length > 0 && alertasLeidas.length === 0,
            etiquetas: etiquetas.map((e)=> e.etiqueta),
            solicitudDetalleActiva: solicitudesDetalles.filter((sd)=> sd.fechaCreacion > alerta.fechaEdicion).length > 0,
            reunionActiva: reuniones.length > 0,
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
 * Edita una alerta abierta: solo cambia la descripcion y agrega fotos nuevas.
 * Actualiza la fecha de edicion y la deja como no leida para todos los encargados.
 *
 * @param {string} idAlerta
 * @param {{descripcion: string, urlsFotosNuevas?: string[]}} datos
 */
export async function actualizar(idAlerta, { descripcion, urlsFotosNuevas = [] }) {
    return prisma.$transaction(async (tx) => {
        const alerta = await tx.alertaBusqueda.findUniqueOrThrow({
            where: { id: idAlerta },
            include: { _count: { select: { fotos: true } } }
        });

        if (alerta.idEstado !== ESTADO_ALERTA.ABIERTO) {
            const err = new Error("Solo se pueden editar alertas en estado Abierta");
            err.statusCode = 409;
            throw err;
        }

        if (alerta._count.fotos + urlsFotosNuevas.length > MAXIMO_FOTOS) {
            const err = new Error("Error en las fotos enviadas");
            err.statusCode = 400;
            err.detalles = [{
                campo: "fotos",
                mensaje: `La alerta puede tener como máximo ${MAXIMO_FOTOS} fotos (tiene ${alerta._count.fotos})`
            }];
            throw err;
        }

        if (descripcion === alerta.descripcion && urlsFotosNuevas.length === 0) {
            const err = new Error("No se detectaron cambios en la alerta");
            err.statusCode = 400;
            throw err;
        }

        // se fija la fecha a mano: Prisma no siempre actualiza @updatedAt si solo cambian relaciones
        const actualizada = await tx.alertaBusqueda.update({
            where: { id: idAlerta },
            data: {
                descripcion,
                fechaEdicion: new Date(),
                fotos: {
                    create: urlsFotosNuevas.map((url) => ({ foto: { create: { url } } }))
                }
            }
        });

        // vuelve a aparecer como no leida para los encargados de oficina
        await tx.alertaLeida.deleteMany({ where: { idAlerta } });

        return { idAlerta: actualizada.id, fechaEdicion: actualizada.fechaEdicion };
    });
}

/**
 * Cierra (elimina) una alerta abierta o vencida. Pasa a "Cerrada" y guarda el motivo y la fecha para auditoria.
 * Los datos se conservan, solo deja de mostrarse a los encargados (visible para administrador).
 * Los encargados que la habian marcado quedan con un aviso de cierre pendiente.
 * @param {string} idAlerta
 * @param {string} [motivo]
 */
export async function cerrar(idAlerta, motivo) {
    const fechaCierre = new Date();
    return prisma.$transaction(async (tx) => {
        // el cambio solo se aplica si sigue "Abierta" o "Vencida", asi dos cierres o un cierre y una edicion simultaneos no se pisan
        const { count } = await tx.alertaBusqueda.updateMany({
            where: { id: idAlerta, idEstado: { in: [ESTADO_ALERTA.ABIERTO, ESTADO_ALERTA.VENCIDO] } },
            data: {
                idEstado: ESTADO_ALERTA.CERRADO,
                motivoCierre: motivo ?? null,
                fechaCierre,
                fechaEdicion: fechaCierre
            }
        });
        if (count === 0) {
            // lanza P2025 (404) si la alerta no existe, si existe es porque ya no esta abierta
            await tx.alertaBusqueda.findUniqueOrThrow({ where: { id: idAlerta }, select: { id: true } });
            const err = new Error("Solo se pueden eliminar alertas en estado Abierta o Vencida");
            err.statusCode = 409;
            throw err;
        }
        // la alerta desaparece de la lista de los encargados, asi que el aviso queda guardado en su marcador.
        // Va en la misma transaccion para que no haya cierre sin aviso (ni aviso sin cierre)
        await tx.marcadorEncargado.updateMany({
            where: { idAlerta },
            data: { avisoCierrePendiente: true }
        });
        return { idAlerta, fechaCierre };
    });
}

/**
 * Reabre una alerta vencida: vuelve a "Abierta" y su fecha de modificacion pasa a ser la actual,
 * con lo que vuelven a contar los plazos de caducidad.
 * @param {string} idAlerta
 */
export async function reabrir(idAlerta) {
    const fechaEdicion = new Date();
    // solo se aplica si sigue "Vencida", asi una reapertura y una eliminacion simultaneas no se pisan
    const { count } = await prisma.alertaBusqueda.updateMany({
        where: { id: idAlerta, idEstado: ESTADO_ALERTA.VENCIDO },
        data: { idEstado: ESTADO_ALERTA.ABIERTO, fechaEdicion }
    });
    if (count === 0) {
        // lanza P2025 (404) si la alerta no existe, si existe es porque no esta vencida
        await prisma.alertaBusqueda.findUniqueOrThrow({ where: { id: idAlerta }, select: { id: true } });
        const err = new Error("Solo se pueden reabrir alertas en estado Vencida");
        err.statusCode = 409;
        throw err;
    }
    return { idAlerta, fechaEdicion };
}

/**
 * Pasa a "Vencida" las alertas abiertas que no se modifican hace DIAS_VENCIMIENTO dias.
 * Se conserva la fecha de modificacion original (no cuenta como una edicion).
 * @returns {Promise<number>} cantidad de alertas vencidas
 */
export async function vencerAlertas() {
    const limite = new Date(Date.now() - DIAS_VENCIMIENTO * MS_POR_DIA);
    const candidatas = await prisma.alertaBusqueda.findMany({
        where: { idEstado: ESTADO_ALERTA.ABIERTO, fechaEdicion: { lt: limite } },
        select: { id: true, fechaEdicion: true }
    });
    if (candidatas.length === 0)
        return 0;

    // una actualizacion por alerta porque @updatedAt pisaria la fecha de edicion; al volver a pasarla explicita se conserva.
    // La condicion por fechaEdicion evita vencer una alerta que el buscador edito justo despues de la consulta
    const resultados = await prisma.$transaction(
        candidatas.map(({ id, fechaEdicion }) => prisma.alertaBusqueda.updateMany({
            where: { id, idEstado: ESTADO_ALERTA.ABIERTO, fechaEdicion },
            data: { idEstado: ESTADO_ALERTA.VENCIDO, fechaEdicion }
        }))
    );
    // devuelve la cantidad de alertas vencidas, que puede ser menor a candidatas si alguna se edito mientras se ejecutaba la transaccion
    return resultados.reduce((total, { count }) => total + count, 0);
}

/**
 * @param {string} idAlerta
 * @returns {Promise<number|null>} id del estado de la alerta, o null si no existe
 */
export async function buscarIdEstado(idAlerta) {
    const alerta = await prisma.alertaBusqueda.findUnique({ where: { id: idAlerta }, select: { idEstado: true } });
    return alerta?.idEstado ?? null;
}

/**
 * Lista las alertas cerradas con su motivo, para auditoria del administrador.
 */
export async function listarCerradas() {
    const alertas = await prisma.alertaBusqueda.findMany({
        where: { idEstado: ESTADO_ALERTA.CERRADO },
        include: {
            campus: true,
            etiquetas: { select: { etiqueta: true } },
            fotos: { select: { foto: true } }
        },
        orderBy: { fechaCierre: { sort: "desc", nulls: "last" } }
    });
    return alertas.map(({ etiquetas, fotos, ...alerta }) => ({
        ...alerta,
        etiquetas: etiquetas.map((e) => e.etiqueta),
        fotos: fotos.map((f) => f.foto)
    }));
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
    const {fotos,etiquetas,reuniones,solicitudesDetalles,...alerta} = await prisma.alertaBusqueda.findUniqueOrThrow({
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
    // aviso de caducidad: la alerta vence DIAS_VENCIMIENTO dias despues de su ultima modificacion
    const fechaVencimiento = new Date(alerta.fechaEdicion.getTime() + DIAS_VENCIMIENTO * MS_POR_DIA);
    const porVencer = alerta.idEstado === ESTADO_ALERTA.ABIERTO
        && Date.now() >= alerta.fechaEdicion.getTime() + DIAS_AVISO_VENCIMIENTO * MS_POR_DIA;
    return {
        ...alerta,
        fechaVencimiento,
        porVencer,
        fotos: fotos.map((f)=>f.foto),
        etiquetas: etiquetas.map((e)=>e.etiqueta),
        solicitudesDetalles: solicitudesDetalles.filter((sd)=> sd.fechaCreacion > alerta.fechaEdicion),
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

export async function buscarNovedades(idAlerta){
    const alerta = await prisma.alertaBusqueda.findUnique({
        where:{
            id: idAlerta
        },
        select: {fechaEdicion:true}
    });
    console.log(idAlerta)
    if(!alerta)
        return false;
    const solicitudes = await prisma.solicitudDetalles.count(
        {
            where: {idAlerta,fechaCreacion: {gt: alerta.fechaEdicion}}
        }
    )
    const reuniones = await prisma.reunion.count(
        {
            where: {idAlerta,fechaCreacion: {gt: alerta.fechaEdicion}}
        }
    )
    if (solicitudes > 0 || reuniones > 0)
        return true;
    // tambien es novedad que la alerta este por vencer o ya vencida (requiere una accion del buscador)
    const alerta = await prisma.alertaBusqueda.findUnique({
        where: { id: idAlerta },
        select: { idEstado: true, fechaEdicion: true }
    });
    if (!alerta)
        return false;
    return alerta.idEstado === ESTADO_ALERTA.VENCIDO
        || (alerta.idEstado === ESTADO_ALERTA.ABIERTO
            && Date.now() >= alerta.fechaEdicion.getTime() + DIAS_AVISO_VENCIMIENTO * MS_POR_DIA);
}