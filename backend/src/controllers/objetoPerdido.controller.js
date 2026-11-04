import { prisma } from '../config/prisma.js';
import { buscarPorRut } from '../services/encargadoOficina.services.js';
import { listar } from '../services/objetoPerdido.services.js';

export const getObjetosPerdidosPublico = async (req, res) => {
  try {
    const objetos = await prisma.objetoPerdido.findMany({
      include: {
        estado: true,
        oficina: true
      }
    });
    res.json(objetos);
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};

export const getObjetosOficina = async (req, res) => {
  try {
    const encargado = await buscarPorRut(req.user.rut);
    if(!encargado)
      return res.status(401).json({"error": "El usuario no es válido"});
    return res.json(await listar({...req.vQuery, idOficina: encargado.idOficina}));
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};

