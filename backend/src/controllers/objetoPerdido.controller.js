import { prisma } from '../config/prisma.js';

export const getObjetosPerdidos = async (req, res) => {
  try {
    const objetos = await prisma.objetoPerdido.findMany({
      include: {
        estado: true,
        encargado: true
      }
    });
    res.json(objetos);
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};
