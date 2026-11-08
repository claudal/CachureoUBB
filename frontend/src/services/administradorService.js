import { api } from "./api.js";

export function buscarContacto(){
    return api.get(`/administrador/contacto`);
}