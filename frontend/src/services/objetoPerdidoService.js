import { conTipoHeic } from "../utils/foto.utils.js";
import { api } from "./api.js";

export function listar(){
    return api.get('/objetoPerdido/oficina');
}

/**
 * Registra un objeto perdido en la oficina del encargado autenticado.
 * @param {{nombre: string, descripcion: string, etiquetas: number[], valioso: boolean, fotos: File[]}} datos
 */
export function crear({ nombre, descripcion, etiquetas, valioso, fotos }){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('valioso', String(Boolean(valioso)));
    etiquetas.forEach((id) => formData.append('etiquetas', String(id)));
    fotos.forEach((foto) => formData.append('fotos', conTipoHeic(foto)));
    return api.postForm('/objetoPerdido', formData);
}

/**
 * Registra un objeto perdido en la oficina del encargado autenticado.
 * @param {{nombre: string, descripcion: string, etiquetas: number[], valioso: boolean, fotos: File[]}} datos
 */
export function actualizar(id,{ nombre, descripcion, etiquetas, fotos }){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    etiquetas.forEach((id) => formData.append('etiquetas', String(id)));
    fotos.forEach((foto) => {
        if(foto instanceof File)
            formData.append('fotos', conTipoHeic(foto));
        else
            formData.append('fotosOriginales', foto.id);
    });
    return api.putForm(`/objetoPerdido/${id}`, formData);
}

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

export function buscarPorId(id){
    return api.get(`/objetoPerdido/${id}`);
}