export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message,
      }));

      return res.status(400).json({
        error: 'Error de validación en los datos enviados',
        detalles: errors,
      });
    }

    if (target === 'query') {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, result.data);
    } else {
      req[target] = result.data;
    }
    next();
  };
};