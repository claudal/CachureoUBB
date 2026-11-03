import { api } from "./api.js";

export function listarPublico(){
    return api.get('/objetoPerdido');
}