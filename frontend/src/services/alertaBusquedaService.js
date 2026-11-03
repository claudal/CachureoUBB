import { api } from "./api.js";

export function listar(filtros){
    if(!filtros)
        filtros = {}
    const query = new URLSearchParams();
    if(filtros.marcado) query.set('marcado',filtros.marcado);
    if(filtros.nombre) query.set('nombre',filtros.nombre);
    if(filtros.palabrasClave) query.set('palabrasClave',filtros.palabrasClave);
    filtros.etiquetasObjeto?.map((id)=>query.append('etiquetaObjeto',id));
    return api.get(`/alertasBusqueda/?${query.toString()}`);
}

export function buscarPorId(id){
    return api.get(`/alertasBusqueda/${id}/`);
}

export function quitarMarcador(id_alerta){
    return api.delete(`/alertasBusqueda/${id_alerta}/marcadores`);
}

export function agregarMarcador(idAlerta){
    return api.post(`/alertasBusqueda/${idAlerta}/marcadores`);
}

export function registrarLectura(idAlerta){
    return api.post(`/alertasBusqueda/${idAlerta}/lecturas`);
}