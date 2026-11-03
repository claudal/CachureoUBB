import { api } from "./api.js";

export function listar(filtros){
    if(!filtros)
        filtros = {}
    const query = new URLSearchParams();
    if(filtros.valioso) query.set('valioso',filtros.valioso);
    return api.get(`/etiquetaObjeto/?${query.toString()}`);
}