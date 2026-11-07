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