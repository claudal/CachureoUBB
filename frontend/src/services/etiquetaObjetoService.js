import { api } from "./api.js";

export function listar(filtros){
    if(!filtros)
        filtros = {}
    const query = new URLSearchParams();
    if(typeof filtros.valioso === 'boolean') query.set('valioso',filtros.valioso);
    return api.get(`/etiquetaObjeto/?${query.toString()}`);
}