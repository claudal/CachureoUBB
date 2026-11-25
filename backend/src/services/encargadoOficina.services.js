import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { encriptarClave } from "../utils/autenticacion.utils.js";
import { crearTokenCreacionClaveEncargado } from "./autenticacion.services.js";
import { enviarCorreoCreacionEncargado } from "./email.services.js";

/**
 * Lista encargados aplicando los filtros opcionales (todos se combinan con AND):
 * nombre (contiene, sin distinguir mayusculas), rut exacto, sede de la oficina,
 * oficina y estado.
 */
export function listar(filtros={}){
    const where = {};
    if(filtros.nombre) where.nombre = { contains: filtros.nombre, mode: "insensitive" };
    if(filtros.rut) where.rut = filtros.rut;
    if(filtros.idOficina) where.idOficina = filtros.idOficina;
    if(filtros.idEstado) where.idEstado = filtros.idEstado;
    if(filtros.idCampus) where.oficina = { idCampus: filtros.idCampus };

    return prisma.encargadoOficina.findMany({
        where,
        omit: {
            clave: true,
            fechaCambioClave: true,
        },
        include: {
            oficina: true,
            estado: true
        },
        skip: filtros.salto,
        take: filtros.cantidad,
        orderBy:{nombre:'asc'}
    })
}

/**
 * 
 * @param {string} rut
 * @param {import("@prisma/client").Prisma.EncargadoOficinaInclude} include
 * @returns 
 */
export function buscarPorRut(rut,include=undefined){
    return prisma.encargadoOficina.findUnique({where:{rut: rut},include});
}

/**
 * 
 * @param {import(import("@prisma/client").Prisma.EncargadoOficinaCreateInput)} data
 * @returns 
 */
export async function crear(data){
    const encargado = await prisma.encargadoOficina.create({
        data: {
            ...data,
            clave: "000000" //clave por defecto, no se puede iniciar sesión por estado "Pendiente"
        },
        omit: {
            clave: true
        }
    });
    const token = crearTokenCreacionClaveEncargado(encargado.rut);
    let correoEnviado;
    try {
        await enviarCorreoCreacionEncargado(encargado.correoContacto,encargado.nombre,token);
        correoEnviado = true;
    } catch(e) {
        correoEnviado = false;
        console.error(e);
    }
    return {encargado,correoEnviado};
}

function errorHttp(mensaje, statusCode){
    const err = new Error(mensaje);
    err.statusCode = statusCode;
    return err;
}

/**
 * Edita el correo de contacto y la oficina del encargado.
 * Si el encargado no existe prisma lanza P2025 (404) y si la oficina no existe P2003 (400).
 *
 * @param {string} rut
 * @param {{correoContacto: string, idOficina: number}} datos
 */
export function editar(rut, {correoContacto, idOficina}){
    return prisma.encargadoOficina.update({
        where: { rut },
        data: { correoContacto, idOficina },
        omit: { clave: true, fechaCambioClave: true },
        include: { oficina: true, estado: true }
    });
}

/**
 * Habilita (1) o deshabilita (3) al encargado. Un encargado pendiente (2) no puede
 * cambiar de estado porque aun no define su clave: debe hacerlo desde el correo de creacion.
 *
 * @param {string} rut
 * @param {1|3} idEstado
 */
export async function cambiarEstado(rut, idEstado){
    const encargado = await buscarPorRut(rut);
    if(!encargado)
        throw errorHttp("El encargado no fue encontrado", 404);
    if(encargado.idEstado === 2)
        throw errorHttp("No se puede cambiar el estado de un encargado pendiente, porque aún no ha definido su clave", 409);
    return prisma.encargadoOficina.update({
        where: { rut },
        data: { idEstado },
        omit: { clave: true, fechaCambioClave: true },
        include: { oficina: true, estado: true }
    });
}

/**
 * Elimina al encargado solo si no tiene entregas ni tratamientos de caducidad asociados.
 * En caso contrario lanza un 409 informando el motivo del rechazo.
 *
 * @param {string} rut
 */
export async function eliminar(rut){
    const encargado = await buscarPorRut(rut);
    if(!encargado)
        throw errorHttp("El encargado no fue encontrado", 404);

    const [cantidadEntregas, cantidadTratamientos] = await Promise.all([
        prisma.entrega.count({ where: { rutEncargado: rut } }),
        prisma.tratamientoCaducidad.count({ where: { rutEncargado: rut } })
    ]);
    if(cantidadEntregas > 0){
        throw errorHttp(
            `No se puede eliminar al encargado porque tiene ${cantidadEntregas} ${cantidadEntregas === 1 ? "entrega asociada" : "entregas asociadas"}. Puede deshabilitarlo para que no inicie sesión`,
            409
        );
    }
    if(cantidadTratamientos > 0){
        throw errorHttp(
            `No se puede eliminar al encargado porque tiene ${cantidadTratamientos} ${cantidadTratamientos === 1 ? "tratamiento de caducidad asociado" : "tratamientos de caducidad asociados"}. Puede deshabilitarlo para que no inicie sesión`,
            409
        );
    }
    try {
        return await prisma.encargadoOficina.delete({
            where: { rut },
            omit: { clave: true, fechaCambioClave: true }
        });
    } catch (error) {
        // P2003: otra tabla sigue apuntando al encargado (por ejemplo una entrega creada justo ahora)
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003")
            throw errorHttp("No se puede eliminar al encargado porque tiene registros asociados", 409);
        throw error;
    }
}

export async function cambiarClave(rut, claveNueva){
    await prisma.encargadoOficina.update({
        where:{
            rut
        },
        data: {
            idEstado: 1,
            fechaCambioClave: new Date(),
            clave: {
                set: encriptarClave(claveNueva)
            }
        }
    });
}

export async function buscarNovedades(rutEncargado){
    const cierreAlerta = await prisma.alertaBusqueda.count({
        where: {
            idEstado: 2,
            marcadores: { some: { rutEncargado, avisoCierrePendiente: true } }
        }
    });
    const modificacionAlerta = await prisma.alertaBusqueda.count(
        {
            where: {
                idEstado: 1,
                marcadores: {
                    some: {
                        rutEncargado
                    }
                },
                alertasLeidas: {
                    none: {
                        rutEncargado
                    }
                }
            }
        }
    );
    return {
        modificacionAlerta: modificacionAlerta+cierreAlerta > 0
    };
}