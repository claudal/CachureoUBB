import { api } from "./api";

export function loginEncargadoOficina(rut, clave){
    return api.post('/autenticacion/login/encargadoOficina/',{rut,clave});
}