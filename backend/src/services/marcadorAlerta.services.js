import { prisma } from "../config/prisma.js";
import { ESTADO_ALERTA } from "../config/estados.js";

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function crear(idAlerta,rutEncargado){
    return prisma.marcadorEncargado.create({data:{idAlerta,rutEncargado}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function eliminar(idAlerta,rutEncargado){
    return prisma.marcadorEncargado.delete({where: {idAlerta_rutEncargado: {idAlerta,rutEncargado}}});
}

/**
 * 
 * @param {import("@prisma/client").Prisma.MarcadorEncargadoCreateInput} data 
 * @returns 
 */
export function buscar(idAlerta,rutEncargado){
    return prisma.marcadorEncargado.findUnique({where:{idAlerta_rutEncargado:{idAlerta,rutEncargado}}});
}

/**
 * Alertas cerradas por su buscador que el encargado habia marcado y cuyo aviso aun no descarta.
 * Solo se entrega lo minimo: los datos de una alerta cerrada los ve solo el administrador.
 *
 * @param {string} rutEncargado
 * @returns {Promise<{id: string, nombre: string, fechaCierre: Date|null}[]>}
 */
export function listarAvisosCierre(rutEncargado){
    return prisma.alertaBusqueda.findMany({
        where: {
            idEstado: ESTADO_ALERTA.CERRADO,
            marcadores: { some: { rutEncargado, avisoCierrePendiente: true } }
        },
        select: { id: true, nombre: true, fechaCierre: true },
        orderBy: { fechaCierre: { sort: "desc", nulls: "last" } }
    });
}

/**
 * El encargado marca como visto el aviso de cierre de una alerta.
 *
 * @param {string} idAlerta
 * @param {string} rutEncargado
 * @returns {Promise<number>} cantidad de avisos descartados (0 si no tenia un aviso pendiente)
 */
export async function descartarAvisoCierre(idAlerta,rutEncargado){
    const { count } = await prisma.marcadorEncargado.updateMany({
        where: { idAlerta, rutEncargado, avisoCierrePendiente: true },
        data: { avisoCierrePendiente: false }
    });
    return count;
}
