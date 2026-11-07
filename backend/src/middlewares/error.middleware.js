import { Prisma } from '@prisma/client';

// Middleware centralizado para el manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Violación de campo único (ej: email repetido)
    if (err.code === 'P2002') {
      const target = err.meta?.target ? err.meta.target.join(', ') : 'campo único';
      return res.status(409).json({
        error: `Ya existe un registro con el mismo valor para [${target}]`
      });
    }

    // P2025: Registro no encontrado al intentar editar o eliminar
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'El recurso solicitado no fue encontrado en la base de datos'
      });
    }

    // P2003: Violación de clave foránea (relación inválida)
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'La relación indicada no es válida (clave foránea inexistente)'
      });
    }
  }

  // Errores con codigo de estado HTTP explicito (ej: 401 Credenciales invalidas).
  // Los servicios usan err.statusCode. Express y sus librerias usan err.status.
  const status = err.statusCode ?? err.status;
  if (status) {
    return res.status(status).json({
      error: err.message,
      // detalles por campo (mismo formato que validate.middleware), si el servicio los envia
      ...(err.detalles && { detalles: err.detalles })
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    error: 'Error interno del servidor',
    details: err.message
  });
};

// Middleware para rutas que no existen (404)
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`
  });
};