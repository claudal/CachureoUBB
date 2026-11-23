import * as services from '../services/campus.services.js';

export const getCampuses = async (req, res, next) => {
  try {
    res.json(await services.listar());
  } catch (err) {
    next(err);
  }
}

export const getOficinasCampus = async (req, res, next) => {
  try {
    res.json(await services.listarOficinas(req.params.id));
  } catch (err) {
    next(err);
  }
}

export const postCampus = async (req, res, next) => {
  try {
    res.status(201).json(await services.crear(req.body));
  } catch (err) {
    next(err);
  }
}

export const putCampus = async (req, res, next) => {
  try {
    res.json(await services.editar(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export const deleteCampus = async (req, res, next) => {
  try {
    res.json(await services.eliminar(req.params.id));
  } catch (err) {
    next(err);
  }
}
