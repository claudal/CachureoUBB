import { api } from "./api.js";

export function listar(){
    return api.get('/personas');
}