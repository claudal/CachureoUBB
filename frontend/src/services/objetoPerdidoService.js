import { api } from "./api.js";

export function listarOficina(filtros){
    if(!filtros)
        filtros = {}
    const query = new URLSearchParams();
    if(Boolean(filtros.valioso)) query.set('valioso',filtros.valioso);
    if(Boolean(filtros.nombre)) query.set('nombre',filtros.nombre);
    if(Boolean(filtros.palabrasClave)) query.set('palabrasClave',filtros.palabrasClave);
    if(Boolean(filtros.idOficina)) query.set('idOficina',filtros.idOficina);
    if(Boolean(filtros.idEstado)) query.set('idEstado',filtros.idEstado);
    if(Boolean(filtros.fechaIngreso)) query.set('fechaIngreso',filtros.fechaIngreso.toISOString());
    filtros.etiquetasObjeto?.map((id)=>query.append('etiquetaObjeto',id));
    return api.get(`/objetoPerdido/oficina/?${query.toString()}`);
}

export function listarPublico(){
    return api.get('/objetoPerdido');
}

