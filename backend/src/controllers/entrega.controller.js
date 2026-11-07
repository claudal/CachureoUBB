import * as services from '../services/entrega.services.js';
import { buscarPorRut } from '../services/encargadoOficina.services.js';

/**
 * Registra la entrega de un objeto de la oficina del encargado autenticado.
 * Espera multipart/form-data con rutReclamante, nombreReclamante,
 * caracteristicaVerificacion (opcional), comentarios (opcional) y foto (opcional, máximo 1).
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function postEntrega(req, res, next) {
  try {
    // la oficina se toma de la base y no del token, así un cambio de oficina se refleja de inmediato
    const encargado = await buscarPorRut(req.user.rut);
    if (!encargado)
      return res.status(401).json({ error: 'El usuario de la sesión ya no existe' });

    const entrega = await services.registrar({
      idObjeto: req.params.id,
      rutEncargado: encargado.rut,
      idOficina: encargado.idOficina,
      rutReclamante: req.body.rutReclamante,
      nombreReclamante: req.body.nombreReclamante,
      caracteristicaVerificacion: req.body.caracteristicaVerificacion,
      comentarios: req.body.comentarios,
      urlFoto: req.files?.[0]?.filename
    });
    res.status(201).json(entrega);
  } catch (err) {
    next(err);
  }
}
