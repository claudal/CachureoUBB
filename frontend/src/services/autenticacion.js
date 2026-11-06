import { api } from "./api";

export function loginEncargadoOficina(credenciales){
    return api.post('/autenticacion/login/encargadoOficina/',credenciales);
}

export function loginAdministrador(credenciales){
    return api.post('/autenticacion/login/administrador/',credenciales);
}

export function getPerfil(){
    return api.get('/autenticacion/perfil/');
}