import { prisma } from '../config/prisma.js';

export const getPersonas = async (req, res) => {
  try {
    const personas = await prisma.persona.findMany({
      include: {
        rol: true
      }
    });
    // Removemos la contraseña de la respuesta por seguridad
    const safePersonas = personas.map(p => {
      const { contrasena, ...rest } = p;
      return rest;
    });
    res.json(safePersonas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
};
