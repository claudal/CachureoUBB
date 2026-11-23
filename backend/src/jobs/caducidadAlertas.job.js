import cron from "node-cron";
import { CRON_VENCIMIENTO_ALERTAS } from "../config/caducidad.js";
import { vencerAlertas } from "../services/alertaBusqueda.services.js";

async function ejecutar() {
    try {
        const cantidad = await vencerAlertas();
        if (cantidad > 0)
            console.log(`=> ${cantidad} alerta(s) de busqueda pasaron a estado Vencido`);
    } catch (error) {
        // un fallo no debe botar el servidor, se reintenta en la siguiente ejecucion
        console.error("Error al vencer las alertas de busqueda:", error);
    }
}

/**
 * Programa el vencimiento automatico de alertas (abiertas sin modificar hace DIAS_VENCIMIENTO dias).
 */
export function iniciarCaducidadAlertas() {
    cron.schedule(CRON_VENCIMIENTO_ALERTAS, ejecutar);
    return ejecutar();
}
