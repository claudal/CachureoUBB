import { prisma } from '../config/prisma.js';
import { listar } from '../services/etiquetaObjeto.services.js';

export const getEtiquetas = async (req,res,next) => {
  try {
    res.json(await listar(req.vQuery));
  } catch (err) {
    next()
  }
};
