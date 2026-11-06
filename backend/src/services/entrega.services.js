import { prisma } from "../config/prisma.js";
import { ESTADO_OBJETO } from "../config/estados.js";

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
        const { count } = await tx.objetoPerdido.updateMany({
            where: { id: idObjeto, idEstado: ESTADO_OBJETO.SIN_ENTREGA },
            data: { idEstado: ESTADO_OBJETO.ENTREGADO }
        });
        if (count === 0)
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
