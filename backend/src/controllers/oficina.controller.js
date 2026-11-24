import * as services from '../services/oficina.services.js';

export const getOficinas = async (req, res, next) => {
  try {
    res.json(await services.listar(req.vQuery));
  } catch (err) {
    next(err);
  }
}

export const getOficina = async (req, res, next) => {
  try {
    res.json(await services.buscarPorId(req.params.id));
  } catch (err) {
    next(err);
  }
}

/**
 * Registra una oficina. Espera multipart/form-data con nombre, descripcion, idCampus y foto.
 * La foto es obligatoria al crear.
 */
export const postOficina = async (req, res, next) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({
        error: 'Error de validación en los datos enviados',
        detalles: [{ campo: 'foto', mensaje: 'Debe subir una foto de la oficina' }]
      });

    res.status(201).json(await services.crear({
      ...req.body,
      urlFoto: req.files[0].filename
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * Edita una oficina. La foto es opcional: si no se envia, se conserva la actual.
 */
export const putOficina = async (req, res, next) => {
  try {
    res.json(await services.editar(req.params.id, {
      ...req.body,
      urlFotoNueva: req.files?.[0]?.filename
    }));
  } catch (err) {
    next(err);
  }
}

export const deleteOficina = async (req, res, next) => {
  try {
    res.json(await services.eliminar(req.params.id));
  } catch (err) {
    next(err);
  }
}
