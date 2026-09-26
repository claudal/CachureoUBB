import jwt from 'jsonwebtoken'

/**
 * Middleware para validar el JWT e inyectar req.user
 * 
 * @param {import("express").Request & { user?: UserPayload }} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export function autenticacion(req, res, next){
  const authHeader = req.headers.autenticacion;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token faltante' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);

    // Inyectamos el usuario desencriptado en el objeto de la solicitud
    req.user = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}