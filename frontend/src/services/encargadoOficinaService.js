import { api } from "./api.js";

export function listar(){
    return api.get('/encargadoOficina');
}

export function crear(data){
    return api.post(`/encargadoOficina`,data);
}

export function reenviarCorreoCreacion(rut){
    return api.post(`/encargadoOficina/${rut}/reenviarCorreoCreacion`);
}