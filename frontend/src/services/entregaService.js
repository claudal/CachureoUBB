import { api } from "./api.js";

/**
 * Lista las entregas de la oficina del encargado autenticado. Solo se envian los filtros que tengan valor.
 * @param {{nombreObjeto?: string, nombreReclamante?: string, rutReclamante?: string, fechaEntrega?: Date, salto?: number, cantidad?: number}} [filtros]
 */
export function listarOficina(filtros){
    const query = new URLSearchParams();
    for(const campo of ['nombreObjeto','nombreReclamante','rutReclamante','salto','cantidad']){
        if(filtros?.[campo]) query.set(campo,filtros[campo]);
    }
    if(filtros?.fechaEntrega) query.set('fechaEntrega',filtros.fechaEntrega.toISOString());
    return api.get(`/entrega/oficina?${query.toString()}`);
}
