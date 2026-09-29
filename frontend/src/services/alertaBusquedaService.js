import { api } from "./api.js";

export function listar(filtros){
    const query = new URLSearchParams();
    if(filtros.id_estado) query.set('id_estado',filtros.id_estado);
    if(filtros.marcado) query.set('marcado',filtros.marcado);
    console.warn(`/alertasBusqueda/?${query.toString()}`)
    return api.get(`/alertasBusqueda/?${query.toString()}`);
}

export function quitarMarcador(id_alerta){
    return api.delete(`/alertasBusqueda/${id_alerta}/marcadores`);
}

export function agregarMarcador(id_alerta){
    return api.post(`/alertasBusqueda/${id_alerta}/marcadores`);
}