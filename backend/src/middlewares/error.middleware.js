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

  // Errores con código de estado HTTP explícito (ej: 401 Credenciales inválidas)
  if (err.status) {
    return res.status(err.status).json({
      error: err.message
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