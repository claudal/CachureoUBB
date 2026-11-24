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
 * (se borra de la BD y del disco), si no, se conserva la actual.
 * Si la oficina no existe, prisma lanza P2025 (404).
 *
 * @param {number} id
 * @param {{nombre: string, descripcion: string, idCampus: number, urlFotoNueva?: string}} datos
 */
export async function editar(id, { nombre, descripcion, idCampus, urlFotoNueva }) {
    const actual = await prisma.oficina.findUniqueOrThrow({ where: { id }, include: INCLUDE_DEFAULT });
    await validarCampus(idCampus);

    const fotosAnteriores = urlFotoNueva ? actual.fotos.map((f) => f.foto) : [];

    const oficina = await prisma.$transaction(async (tx) => {
        // borrar la foto borra tambien su relacion con la oficina (cascade)
        if (fotosAnteriores.length > 0)
            await tx.foto.deleteMany({ where: { id: { in: fotosAnteriores.map((f) => f.id) } } });

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
    for (const foto of fotosAnteriores)
        await eliminarArchivoFisico(foto.url);

    return formatear(oficina);
}

/**
 * Elimina la oficina solo si no tiene encargados ni objetos perdidos asociados.
 * Si los tiene, lanza un 409 informando el motivo del rechazo.
 * Tambien elimina su foto de la BD y del disco.
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

    const fotos = oficina.fotos.map((f) => f.foto);
    try {
        await prisma.$transaction([
            prisma.oficina.delete({ where: { id } }),
            // la oficina solo borra su relacion con la foto (cascade), la foto hay que borrarla aparte
            prisma.foto.deleteMany({ where: { id: { in: fotos.map((f) => f.id) } } })
        ]);
    } catch (error) {
        // P2003: alguien asigno un encargado u objeto a la oficina despues de contarlos
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            const err = new Error("No se puede eliminar la oficina porque tiene encargados u objetos perdidos asociados");
            err.statusCode = 409;
            throw err;
        }
        throw error;
    }

    for (const foto of fotos)
        await eliminarArchivoFisico(foto.url);

    return formatear(oficina);
}
