import { crearTokenCreacionClaveEncargado, crearTokenRestablecimientoClaveEncargado } from '../services/autenticacion.services.js';
import { enviarCorreoCreacionEncargado, enviarCorreoRestablecimiento } from '../services/email.services.js';
import { buscarPorRut, crear, listar } from '../services/encargadoOficina.services.js';

export const getEncargados = async (req, res, next) => {
  try {
    if(!req.user.correo)
      return res.status(403).json({error: "No tiene permisos para listar encargados"});
    console.log(req.vQuery)
    res.json(await listar(req.vQuery));
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

export const postEnviarCorreoReestablecimientoEncargado = async (req, res, next) => {
  try {
    const encargado = await buscarPorRut(req.params.rut);
    if(encargado?.idEstado === 1) {
      enviarCorreoRestablecimiento(
        encargado.correoContacto,
        encargado.nombre,
        crearTokenRestablecimientoClaveEncargado(encargado.rut)
      )
    }
    return res.status(200).json({"mensaje": "Solicitud de reestablecimiento de clave enviada con éxito"});
  } catch (error) {
    next(error);
  }
};