import { api } from "./api";

export function login(rut, contrasena){
    return api.post('/autenticacion/login/',{rut,contrasena});
}