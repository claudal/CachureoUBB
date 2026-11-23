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

/**
 * Alertas marcadas por el encargado que su buscador eliminó y cuyo aviso aún no descarta.
 * @returns {Promise<{id: string, nombre: string, fechaCierre: string|null}[]>}
 */
export function listarAvisosCierre(){
    return api.get('/alertasBusqueda/avisosCierre');
}

export function descartarAvisoCierre(idAlerta){
    return api.delete(`/alertasBusqueda/${idAlerta}/avisoCierre`);
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

/**
 * Edita una alerta abierta: solo cambia la descripción y agrega fotos nuevas.
 * De `fotos` solo se envían los archivos nuevos (File); las fotos que ya tiene la alerta se ignoran.
 * @param {string} idAlerta
 * @param {{descripcion: string, fotos?: Array<File|{id: number, url: string}>}} datos
 */
export function actualizar(idAlerta, { descripcion, fotos = [] }){
    const formData = new FormData();
    formData.append('descripcion', descripcion);
    fotos.forEach((foto) => {
        if(foto instanceof File)
            formData.append('fotos', conTipoHeic(foto));
    });
    return api.putForm(`/alertasBusqueda/${idAlerta}`, formData);
}

/**
 * Elimina (cierra) una alerta abierta. El motivo es opcional.
 * @param {string} idAlerta
 * @param {string} [motivo]
 */
export function eliminar(idAlerta, motivo){
    const motivoLimpio = motivo?.trim();
    return api.delete(`/alertasBusqueda/${idAlerta}`, motivoLimpio ? { motivo: motivoLimpio } : undefined);
}

/**
 * Reabre una alerta vencida: vuelve a estar abierta y se renuevan sus plazos de caducidad.
 * @param {string} idAlerta
 */
export function reabrir(idAlerta){
    return api.post(`/alertasBusqueda/${idAlerta}/reapertura`);
}

/**
 * Crea una alerta de búsqueda
 * @param {{nombre: string, descripcion: string, etiquetas: number[], fotos: File[]}} datos
 */
export function crearSolicitud(idAlerta,data){
    return api.post(`/alertasBusqueda/${idAlerta}/solicitudesDetalles`, data);
}

/**
 * Crea una alerta de búsqueda
 * @param {{nombre: string, descripcion: string, etiquetas: number[], fotos: File[]}} datos
 */
export function crearReunion(idAlerta,data){
    return api.post(`/alertasBusqueda/${idAlerta}/reuniones`, data);
}

export async function buscarNovedad(idAlerta){
    if(!idAlerta)
        return;
    return api.get(`/alertasBusqueda/${idAlerta}/solicitudesDetalles/novedad`);
}
