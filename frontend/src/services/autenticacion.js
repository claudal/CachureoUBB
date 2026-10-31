import { api } from "./api";

export function loginEncargadoOficina(credenciales){
    return api.post('/autenticacion/login/encargadoOficina/',credenciales);
}