import { api } from "./api.js";

/**
 * Lista encargados. Solo se envian los filtros que tengan valor.
 * @param {{nombre?: string, rut?: string, idCampus?: number|null, idOficina?: number|null, salto?: number, cantidad?: number}} [filtros]
 */
export function listar(filtros){
    const query = new URLSearchParams();
    for(const campo of ['nombre','rut','idCampus','idOficina','salto','cantidad']){
        if(filtros?.[campo]) query.set(campo,filtros[campo]);
    }
    return api.get(`/encargadoOficina/?${query.toString()}`);
}

export function crear(data){
    return api.post(`/encargadoOficina`,data);
}

export function actualizar(rut,data){
    return api.put(`/encargadoOficina/${rut}`,data);
}

/**
 * @param {string} rut
 * @param {1|3} idEstado 1 habilitado, 3 deshabilitado
 */
export function cambiarEstado(rut,idEstado){
    return api.patch(`/encargadoOficina/${rut}/estado`,{idEstado});
}

export function eliminar(rut){
    return api.delete(`/encargadoOficina/${rut}`);
}

export function reenviarCorreoCreacion(rut){
    return api.post(`/encargadoOficina/${rut}/reenviarCorreoCreacion`);
}

export function enviarCorreoRestablecimientoClave(rut){
    return api.post(`/encargadoOficina/${rut}/enviarCorreoRestablecimientoClave`);
}

export function buscarNovedades(){
    return api.get(`/encargadoOficina/novedades`);
}