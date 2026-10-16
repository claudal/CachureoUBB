import { prisma } from '../config/prisma.js';

export const getEncargados = async (req, res) => {
  try {
    const encargados = await prisma.encargadoOficina.findMany();
    // Removemos la contraseña de la respuesta por seguridad
    const safeEncargados = encargados.map(p => {
      const { clave, ...rest } = p;
      return rest;
    });
    res.json(safeEncargados);
  } catch (error) {
    console.error('Error fetching encargados:', error);
    res.status(500).json({ error: 'Error al obtener los encargados' });
  }
};
