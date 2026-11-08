import { api } from "./api.js";

export function listar(filtros){
    if(!filtros)
        filtros = {}
    const query = new URLSearchParams();
    if(Boolean(filtros.salto)) query.set('salto',filtros.salto);
    if(Boolean(filtros.cantidad)) query.set('cantidad',filtros.cantidad);
    return api.get(`/encargadoOficina/?${query.toString()}`);
}

export function crear(data){
    return api.post(`/encargadoOficina`,data);
}

export function reenviarCorreoCreacion(rut){
    return api.post(`/encargadoOficina/${rut}/reenviarCorreoCreacion`);
}