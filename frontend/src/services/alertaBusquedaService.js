import { api } from "./api.js";

export function listar(filtros){
    const query = new URLSearchParams();
    if(filtros.idEstado) query.set('idEstado',filtros.idEstado);
    if(filtros.marcado) query.set('marcado',filtros.marcado)
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