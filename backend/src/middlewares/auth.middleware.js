import jwt from 'jsonwebtoken'

/**
 * Middleware para validar el JWT e inyectar req.user
 * 
 * @param {import("express").Request & { user?: UserPayload }} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export function autenticacion(req, res, next){
  // obtiene el token de autenticación del encabezado de la petición
  const authHeader = req.headers.autenticacion;

  // verifica que el token exista y venga en el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token faltante' });
  }

  //obtiene el token
  const token = authHeader.split(' ')[1];

  try {
    // verifica y extrae el usuario del token
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.user = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}