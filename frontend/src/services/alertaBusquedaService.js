import { api } from "./api.js";

export function listar(filtros){
    const query = new URLSearchParams();
    if(filtros.idEstado) query.set('idEstado',filtros.idEstado);
    if(filtros.marcado) query.set('marcado',filtros.marcado);
    console.warn(`/alertasBusqueda/?${query.toString()}`)
    return api.get(`/alertasBusqueda/?${query.toString()}`);
}

export function quitarMarcador(idAlerta){
    return api.delete(`/alertasBusqueda/${idAlerta}/marcadores`);
}

export function agregarMarcador(idAlerta){
    return api.post(`/alertasBusqueda/${idAlerta}/marcadores`);
}

export function registrarLectura(idAlerta){
    return api.post(`/alertasBusqueda/${idAlerta}/lecturas`);
}