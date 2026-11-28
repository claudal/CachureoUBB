import { conTipoHeic } from "../utils/foto.utils.js";
import { api } from "./api.js";

/**
 * Lista las oficinas con su campus y su foto, opcionalmente de un solo campus.
 * @param {{idCampus?: number|null}} [filtros]
 */
export function listar(filtros){
    const query = new URLSearchParams();
    if(filtros?.idCampus) query.set('idCampus',filtros.idCampus);
    return api.get(`/oficina?${query.toString()}`);
}

/**
 * Registra una oficina. La foto viaja en el campo "foto" (multipart/form-data).
 * @param {{nombre: string, descripcion: string, idCampus: number, fotos: File[]}} datos
 */
export function crear({ nombre, descripcion, idCampus, fotos }){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('idCampus', String(idCampus));
    formData.append('foto', conTipoHeic(fotos[0]));
    return api.postForm('/oficina', formData);
}

/**
 * Edita una oficina. Si la foto no cambio (sigue siendo la guardada, no un File),
 * no se envia y el servidor conserva la actual.
 * @param {number} id
 * @param {{nombre: string, descripcion: string, idCampus: number, fotos: Array<File|{id: number, url: string}>}} datos
 */
export function actualizar(id, { nombre, descripcion, idCampus, fotos }){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('idCampus', String(idCampus));
    if(fotos[0] instanceof File)
        formData.append('foto', conTipoHeic(fotos[0]));
    return api.putForm(`/oficina/${id}`, formData);
}

export function eliminar(id){
    return api.delete(`/oficina/${id}`);
}
