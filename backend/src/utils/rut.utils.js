import rutjs from 'rut.js';

export function formatear(rut){
    return rutjs.format(rut,{dots:true});
}

export function validar(rut){
    return rutjs.validate(rut);
}

export function limpiar(rut){
    return rutjs.clean(rut);
}