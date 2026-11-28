import { crearTokenCreacionClaveEncargado, crearTokenRestablecimientoClaveEncargado } from '../services/autenticacion.services.js';
import { enviarCorreoCreacionEncargado, enviarCorreoRestablecimientoEncargado } from '../services/email.services.js';
import { buscarNovedades, buscarPorRut, cambiarEstado, crear, editar, eliminar, listar } from '../services/encargadoOficina.services.js';

export const getEncargados = async (req, res, next) => {
  try {
    res.json(await listar(req.vQuery));
  } catch (error) {
    next(error);
  }
};

export const postEncargado = async (req, res, next) => {
  try {
    res.status(201).json(await crear(req.body));
  } catch (error) {
    next(error);
  }
};

export const putEncargado = async (req, res, next) => {
  try {
    res.json(await editar(req.params.rut, req.body));
  } catch (error) {
    next(error);
  }
};

export const patchEstadoEncargado = async (req, res, next) => {
  try {
    res.json(await cambiarEstado(req.params.rut, req.body.idEstado));
  } catch (error) {
    next(error);
  }
};

export const deleteEncargado = async (req, res, next) => {
  try {
    res.json(await eliminar(req.params.rut));
  } catch (error) {
    next(error);
  }
};

export const postReenviarCorreoCreacionEncargado = async (req, res, next) => {
  try {
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
      enviarCorreoRestablecimientoEncargado(
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

export const getNovedades = async (req, res, next) => {
  try {
    return res.status(200).json(await buscarNovedades(req.user.rut));
  } catch (error) {
    next(error);
  }
};