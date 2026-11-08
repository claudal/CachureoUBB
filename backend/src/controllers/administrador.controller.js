import { buscarContacto } from '../services/administrador.services.js';

export const getContacto = async (req, res, next) => {
  try {
    res.json(await buscarContacto());
  } catch (error) {
    next(error);
  }
};