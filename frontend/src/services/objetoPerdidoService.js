import { api } from "./api.js";

// algunos navegadores dejan vacío el tipo de las fotos HEIC de iPhone y el backend las rechazaría
function conTipoHeic(foto){
    if (foto.type || !/\.(heic|heif)$/i.test(foto.name))
        return foto;
    const tipo = /\.heif$/i.test(foto.name) ? 'image/heif' : 'image/heic';
    return new File([foto], foto.name, { type: tipo });
}

export function listar(){
    return api.get('/objetos');
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
    return api.postForm('/objetos', formData);
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

