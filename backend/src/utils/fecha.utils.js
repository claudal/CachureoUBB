export function calcularRangoDia(fecha) {
    const inicioFecha = new Date(fecha);

    const finFecha = new Date(fecha);
    finFecha.setHours(inicioFecha.getHours()+23);
    finFecha.setMinutes(inicioFecha.getMinutes()+59);
    finFecha.setSeconds(inicioFecha.getSeconds()+59);
    finFecha.setMilliseconds(inicioFecha.getMilliseconds()+999);
    return { inicioFecha, finFecha };
}