import { api } from "./api.js";

export function listar(){
    return api.get(`/campus`);
}

export async function listarOficinas(idCampus){
    if(!idCampus)
        return;
    return api.get(`/campus/${idCampus}/oficinas`);
}