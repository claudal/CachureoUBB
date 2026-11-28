import { api } from "./api.js";

export function listar(){
    return api.get(`/campus`);
}

export async function listarOficinas(idCampus){
    if(!idCampus)
        return;
    return api.get(`/campus/${idCampus}/oficinas`);
}

export function crear(data){
    return api.post(`/campus`,data);
}

export function actualizar(id,data){
    return api.put(`/campus/${id}`,data);
}

export function eliminar(id){
    return api.delete(`/campus/${id}`);
}
