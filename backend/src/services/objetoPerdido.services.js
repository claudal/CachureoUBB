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

/**
 * Objetos guardados en una oficina, del más reciente al más antiguo.
 * @param {number} idOficina
 */
export async function listarPorOficina(idOficina) {
    const objetos = await prisma.objetoPerdido.findMany({
        where: { idOficina },
        include,
        orderBy: { fechaIngreso: 'desc' }
    });
    return objetos.map(formatear);
}
