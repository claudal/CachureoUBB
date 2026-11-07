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
    if(Boolean(filtros.fechaEntrega)) query.set('fechaEntrega',filtros.fechaEntrega.toISOString());
    filtros.etiquetasObjeto?.map((id)=>query.append('etiquetaObjeto',id));
    return api.get(`/objetoPerdido/oficina/?${query.toString()}`);
}

export function listarPublico(filtros){
    if(!filtros)
        filtros = {}
    const query = new URLSearchParams();
    if(Boolean(filtros.nombre)) query.set('nombre',filtros.nombre);
    if(Boolean(filtros.palabrasClave)) query.set('palabrasClave',filtros.palabrasClave);
    if(Boolean(filtros.idCampus)) query.set('idCampus',filtros.idCampus);
    if(Boolean(filtros.salto)) query.set('salto',filtros.salto);
    if(Boolean(filtros.cantidad)) query.set('cantidad',filtros.cantidad);
    filtros.etiquetasObjeto?.map((id)=>query.append('etiquetaObjeto',id));
    return api.get(`/objetoPerdido/publico/?${query.toString()}`);
}

export function buscarPorId(id){
    return api.get(`/objetoPerdido/${id}`);
}

export function eliminarPorId(id){
    return api.delete(`/objetoPerdido/${id}`);
}

/**
 * Registra la entrega de un objeto "Sin entrega" a quien lo reclama.
 * Los campos opcionales vacios no se envian. La foto de verificacion va en el campo "foto".
 * @param {number} id
 * @param {{rutReclamante: string, nombreReclamante: string, caracteristicaVerificacion?: string, comentarios?: string, fotos?: File[]}} datos
 */
export function registrarEntrega(id, { rutReclamante, nombreReclamante, caracteristicaVerificacion, comentarios, fotos = [] }){
    const formData = new FormData();
    formData.append('rutReclamante', rutReclamante);
    formData.append('nombreReclamante', nombreReclamante);
    if (caracteristicaVerificacion) formData.append('caracteristicaVerificacion', caracteristicaVerificacion);
    if (comentarios) formData.append('comentarios', comentarios);
    if (fotos[0]) formData.append('foto', conTipoHeic(fotos[0]));
    return api.postForm(`/objetoPerdido/${id}/entrega`, formData);
}