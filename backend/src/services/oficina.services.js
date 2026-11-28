import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { eliminarArchivoFisico } from "./foto.services.js";

/**@type {import("@prisma/client").Prisma.OficinaInclude}*/
const INCLUDE_DEFAULT = {
    campus: true,
    fotos: { include: { foto: true }, orderBy: { foto: { id: 'asc' } } }
};

// deja las fotos como lista simple, igual que en los objetos perdidos
function formatear(oficina) {
    const { fotos, ...restoOficina } = oficina;
    return { ...restoOficina, fotos: fotos.map((f) => f.foto) };
}

function pluralizar(cantidad, singular, plural) {
    return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

/**
 * Borra de la BD las fotos que quedaron sin ningun uso (ni oficinas, ni objetos, ni alertas,
 * ni entregas) y devuelve las borradas para que el llamador elimine sus archivos.
 * Una foto que otro registro sigue usando se deja intacta, asi no se rompe ese registro
 * (pasa con los datos de prueba, donde varias oficinas comparten la misma foto).
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {{id: number, url: string}[]} fotos
 */
async function borrarFotosHuerfanas(tx, fotos) {
    if (fotos.length === 0) return [];
    const huerfanas = await tx.foto.findMany({
        where: {
            id: { in: fotos.map((f) => f.id) },
            oficinas: { none: {} },
            objetos: { none: {} },
            alertas: { none: {} },
            entrega: null
        }
    });
    if (huerfanas.length > 0)
        await tx.foto.deleteMany({ where: { id: { in: huerfanas.map((f) => f.id) } } });
    return huerfanas;
}

async function validarCampus(idCampus) {
    const campus = await prisma.campus.findUnique({ where: { id: idCampus } });
    if (!campus) {
        const err = new Error("Error de validación en los datos enviados");
        err.statusCode = 400;
        err.detalles = [{ campo: "idCampus", mensaje: "La sede seleccionada no existe" }];
        throw err;
    }
}

/**
 * Lista las oficinas con su sede y su foto, opcionalmente de una sola sede.
 *
 * @param {{idCampus?: number}} filtros
 */
export async function listar({ idCampus } = {}) {
    const oficinas = await prisma.oficina.findMany({
        where: { idCampus },
        include: INCLUDE_DEFAULT,
        orderBy: { nombre: "asc" }
    });
    return oficinas.map(formatear);
}

/**
 * Si la oficina no existe, prisma lanza P2025 (404).
 *
 * @param {number} id
 */
export async function buscarPorId(id) {
    const oficina = await prisma.oficina.findUniqueOrThrow({ where: { id }, include: INCLUDE_DEFAULT });
    return formatear(oficina);
}

/**
 * Registra una oficina con su foto.
 *
 * @param {{nombre: string, descripcion: string, idCampus: number, urlFoto: string}} datos
 */
export async function crear({ nombre, descripcion, idCampus, urlFoto }) {
    await validarCampus(idCampus);
    const oficina = await prisma.oficina.create({
        data: {
            nombre,
            descripcion,
            idCampus,
            fotos: { create: [{ foto: { create: { url: urlFoto } } }] }
        },
        include: INCLUDE_DEFAULT
    });
    return formatear(oficina);
}

/**
 * Edita la oficina. Si llega una foto nueva, reemplaza a la anterior
 * (se borra de la BD y del disco si nadie mas la usa), si no, se conserva la actual.
 * Si la oficina no existe, prisma lanza P2025 (404).
 *
 * @param {number} id
 * @param {{nombre: string, descripcion: string, idCampus: number, urlFotoNueva?: string}} datos
 */
export async function editar(id, { nombre, descripcion, idCampus, urlFotoNueva }) {
    const actual = await prisma.oficina.findUniqueOrThrow({ where: { id }, include: INCLUDE_DEFAULT });
    await validarCampus(idCampus);

    const fotosAnteriores = urlFotoNueva ? actual.fotos.map((f) => f.foto) : [];
    let fotosABorrar = [];

    const oficina = await prisma.$transaction(async (tx) => {
        // primero se suelta la relacion de la oficina con sus fotos anteriores
        if (fotosAnteriores.length > 0) {
            await tx.fotoOficina.deleteMany({ where: { idOficina: id } });
            fotosABorrar = await borrarFotosHuerfanas(tx, fotosAnteriores);
        }

        return tx.oficina.update({
            where: { id },
            data: {
                nombre,
                descripcion,
                idCampus,
                ...(urlFotoNueva && { fotos: { create: [{ foto: { create: { url: urlFotoNueva } } }] } })
            },
            include: INCLUDE_DEFAULT
        });
    });

    // el archivo se borra recien cuando la BD ya quedo actualizada
    for (const foto of fotosABorrar)
        await eliminarArchivoFisico(foto.url);

    return formatear(oficina);
}

/**
 * Elimina la oficina solo si no tiene encargados ni objetos perdidos asociados.
 * Si los tiene, lanza un 409 informando el motivo del rechazo.
 * Tambien elimina su foto de la BD y del disco si nadie mas la usa.
 *
 * @param {number} id
 */
export async function eliminar(id) {
    const oficina = await prisma.oficina.findUniqueOrThrow({ where: { id }, include: INCLUDE_DEFAULT });

    const [cantidadEncargados, cantidadObjetos] = await Promise.all([
        prisma.encargadoOficina.count({ where: { idOficina: id } }),
        prisma.objetoPerdido.count({ where: { idOficina: id } })
    ]);

    const motivos = [];
    if (cantidadEncargados > 0)
        motivos.push(pluralizar(cantidadEncargados, "encargado asignado", "encargados asignados"));
    if (cantidadObjetos > 0)
        motivos.push(pluralizar(cantidadObjetos, "objeto perdido asociado", "objetos perdidos asociados"));

    if (motivos.length > 0) {
        const err = new Error(
            `No se puede eliminar la oficina porque tiene ${motivos.join(" y ")}. Reasigne o elimine los encargados y objetos primero`
        );
        err.statusCode = 409;
        throw err;
    }

    let fotosABorrar = [];
    try {
        await prisma.$transaction(async (tx) => {
            // borrar la oficina borra su relacion con las fotos (cascade), pero no las fotos
            await tx.oficina.delete({ where: { id } });
            fotosABorrar = await borrarFotosHuerfanas(tx, oficina.fotos.map((f) => f.foto));
        });
    } catch (error) {
        // P2003: alguien asigno un encargado u objeto a la oficina despues de contarlos
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            const err = new Error("No se puede eliminar la oficina porque tiene encargados u objetos perdidos asociados");
            err.statusCode = 409;
            throw err;
        }
        throw error;
    }

    for (const foto of fotosABorrar)
        await eliminarArchivoFisico(foto.url);

    return formatear(oficina);
}
