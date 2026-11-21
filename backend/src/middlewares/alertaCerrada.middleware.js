import { ESTADO_ALERTA } from "../config/estados.js";
import { buscarIdEstado } from "../services/alertaBusqueda.services.js";

/**
 * Responde 404 si la alerta de la ruta (:id) no existe o ya fue cerrada.
 * Una alerta cerrada solo la ve el administrador, asi que para el resto es como si no existiera.
 * Debe ir despues de validar el parametro :id.
 *
 * @type {import("express").RequestHandler}
 */
export async function ocultarAlertaCerrada(req, res, next) {
  try {
    const idEstado = await buscarIdEstado(req.params.id);
    if (idEstado === null || idEstado === ESTADO_ALERTA.CERRADO)
      return res.status(404).json({ error: "La alerta no existe o fue eliminada" });
    next();
  } catch (err) {
    next(err);
  }
}
