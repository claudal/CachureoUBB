import { prisma } from '../config/prisma.js';
import { crearTokenCreacionClaveEncargado } from '../services/autenticacion.services.js';
import { enviarCorreoCreacionEncargado } from '../services/email.services.js';
import { buscarPorRut, crear } from '../services/encargadoOficina.services.js';

export const getEncargados = async (req, res, next) => {
  try {
    const encargados = await prisma.encargadoOficina.findMany();
    // Removemos la contraseña de la respuesta por seguridad
    const safeEncargados = encargados.map(p => {
      const { clave, ...rest } = p;
      return rest;
    });
    res.json(safeEncargados);
  } catch (error) {
    next(error);
  }
};

export const postEncargado = async (req, res, next) => {
  try {
    if(!req.user.correo)
      return res.status(403).json({error: "No tiene permisos para crear el encargado"});
    res.status(201).json(await crear(req.body));
  } catch (error) {
    next(error);
  }
};

export const postReenviarCorreoCreacionEncargado = async (req, res, next) => {
  try {
    if(!req.user.correo)
      return res.status(403).json({error: "No tiene permisos para enviar el correo de creación"});
    const encargado = await buscarPorRut(req.params.rut);
    if(encargado.idEstado !== 2)
      return res.status(403).json({error: "No tiene permisos para enviar el correo de creación"});
    await enviarCorreoCreacionEncargado(
      encargado.correoContacto,
      encargado.nombre,
      crearTokenCreacionClaveEncargado(encargado.rut)
    )
    res.status(200).json({"mensaje": "Correo reenviado con éxito"});
  } catch (error) {
    next(error);
  }
};