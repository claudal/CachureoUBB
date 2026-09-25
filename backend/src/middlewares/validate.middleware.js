/**
 * 
 * @param {import("zod").ZodObject} schema 
 * @param {'body'|'query'|'params'} [target='body'] 
 * @param {string} [targetResult=target] 
 * @returns 
 */
export const validate = (schema, target = 'body', targetResult = target) => {
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
    
    req[targetResult] = result.data;
    next();
  };
};