import { prisma } from "../config/prisma.js";
import { ESTADO_OBJETO } from "../config/estados.js";
import { calcularRangoDia } from "../utils/fecha.utils.js";

/**
 * Datos de la entrega que se muestran junto al objeto (trazabilidad).
 * Del encargado solo se envían rut y nombre, nunca la clave.
 * @type {import("@prisma/client").Prisma.EntregaInclude}
 */
export const INCLUDE_ENTREGA = {
    reclamante: true,
    encargado: { select: { rut: true, nombre: true } },
    foto: true
};

function errorConEstado(mensaje, statusCode, detalles) {
    const err = new Error(mensaje);
    err.statusCode = statusCode;
    if (detalles) err.detalles = detalles;
    return err;
}

/**
 * Historial de entregas de los objetos de una oficina, de la mas reciente a la mas antigua.
 * Cada entrega incluye su objeto con las etiquetas y fotos como listas simples.
 *
 * @param {{
 *   idOficina: number,
 *   nombreObjeto?: string,
 *   nombreReclamante?: string,
 *   rutReclamante?: string,
 *   fechaEntrega?: string,
 *   salto?: number,
 *   cantidad?: number
 * }} filtros
 */
export async function listar({ idOficina, nombreObjeto, nombreReclamante, rutReclamante, fechaEntrega, salto, cantidad }) {
    // la oficina de una entrega es la del objeto entregado
    /**@type {import("@prisma/client").Prisma.EntregaWhereInput} */
    const where = { objeto: { idOficina } };

    if (nombreObjeto)
        where.objeto.nombre = { contains: nombreObjeto, mode: "insensitive" };
    if (nombreReclamante)
        where.reclamante = { nombreReclamante: { contains: nombreReclamante, mode: "insensitive" } };
    if (rutReclamante)
        where.rutReclamante = rutReclamante;
    if (fechaEntrega) {
        const fechas = calcularRangoDia(fechaEntrega);
        where.fechaEntrega = { gte: fechas.inicioFecha, lte: fechas.finFecha };
    }

    const entregas = await prisma.entrega.findMany({
        where,
        include: {
            ...INCLUDE_ENTREGA,
            objeto: {
                include: {
                    etiquetas: { include: { etiqueta: true } },
                    fotos: { include: { foto: true }, orderBy: { foto: { id: 'asc' } } }
                }
            }
        },
        skip: salto,
        take: cantidad,
        // el id desempata para que la paginacion sea estable
        orderBy: [{ fechaEntrega: 'desc' }, { id: 'desc' }]
    });

    return entregas.map(({ objeto, ...entrega }) => ({
        ...entrega,
        objeto: {
            ...objeto,
            etiquetas: objeto.etiquetas.map((e) => e.etiqueta),
            fotos: objeto.fotos.map((e) => e.foto)
        }
    }));
}

/**
 * Entrega un objeto "Sin entrega" a quien lo reclama y lo deja "Entregado",
 * ligado al reclamante y al encargado responsable.
 * Si el objeto es valioso exige una característica de verificación o una foto.
 *
 * @param {{
 *   idObjeto: number,
 *   rutEncargado: string,
 *   idOficina: number,
 *   rutReclamante: string,
 *   nombreReclamante: string,
 *   caracteristicaVerificacion?: string,
 *   comentarios?: string,
 *   urlFoto?: string
 * }} datos
 */
export async function registrar({
    idObjeto, rutEncargado, idOficina,
    rutReclamante, nombreReclamante,
    caracteristicaVerificacion, comentarios, urlFoto
}) {
    return prisma.$transaction(async (tx) => {
        const objeto = await tx.objetoPerdido.findUnique({ where: { id: idObjeto } });
        if (!objeto)
            throw errorConEstado("El objeto no existe", 404);
        if (objeto.idOficina !== idOficina)
            throw errorConEstado("El objeto no pertenece a su oficina", 403);
        if (objeto.idEstado !== ESTADO_OBJETO.SIN_ENTREGA)
            throw errorConEstado("El objeto ya no está disponible para entrega", 409);
        if (objeto.valioso && !caracteristicaVerificacion && !urlFoto)
            throw errorConEstado("Error de validación en los datos enviados", 400, [{
                campo: "caracteristicaVerificacion",
                mensaje: "El objeto es de valor: ingrese una característica que solo el dueño conocería o una foto de verificación"
            }]);

        // el cambio de estado solo se aplica si sigue "Sin entrega",
        // así dos entregas simultáneas del mismo objeto no pasan ambas
        const objetoEntregado = await tx.objetoPerdido.update({
            where: { id: idObjeto, idEstado: ESTADO_OBJETO.SIN_ENTREGA },
            data: { idEstado: ESTADO_OBJETO.ENTREGADO }
        });
        if (!objetoEntregado)
            throw errorConEstado("El objeto ya no está disponible para entrega", 409);

        // si el reclamante ya retiró otro objeto se reutiliza su registro sin cambiar el nombre guardado
        await tx.reclamante.upsert({
            where: { rut: rutReclamante },
            update: {},
            create: { rut: rutReclamante, nombreReclamante }
        });

        const foto = urlFoto ? await tx.foto.create({ data: { url: urlFoto } }) : null;

        return tx.entrega.create({
            data: {
                idObjeto,
                rutEncargado,
                rutReclamante,
                caracteristicaVerificacion,
                comentarios,
                idFoto: foto?.id
            },
            include: INCLUDE_ENTREGA
        });
    });
}
