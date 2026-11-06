import { useAlertaLocal } from "../hooks/useAlertaLocal.js";
import { conTipoHeic } from "../utils/foto.utils.js";
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

export async function buscarPorId(id){
    if(!Boolean(id))
        return;
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

/**
 * Crea una alerta de búsqueda
 * @param {{nombre: string, descripcion: string, etiquetas: number[], fotos: File[]}} datos
 */
export function crear({ nombre, descripcion, etiquetas, fotos, idCampus }){
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('idCampus', idCampus);
    etiquetas.forEach((id) => formData.append('etiquetas', String(id)));
    fotos.forEach((foto) => formData.append('fotos', conTipoHeic(foto)));
    return api.postForm('/alertasBusqueda', formData);
}