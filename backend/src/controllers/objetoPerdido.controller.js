import * as services from '../services/objetoPerdido.services.js';
import { buscarPorRut } from '../services/encargadoOficina.services.js';

// la oficina se toma de la base y no del token, así un cambio de oficina se refleja de inmediato
async function buscarEncargadoSesion(req, res) {
  const encargado = await buscarPorRut(req.user.rut);
  if (!encargado)
    res.status(401).json({ error: 'El usuario de la sesión ya no existe' });
  return encargado;
}

export const getObjetosPerdidosPublico = async (req, res) => {
  try {
    res.json(await services.listarPublico(req.vQuery));
  } catch (err) {
    console.error('Error fetching public objects:', err);
  }
}

/**
 * Registra un objeto perdido en la oficina del encargado autenticado.
 * Espera multipart/form-data con nombre, descripcion, etiquetas[], valioso y fotos[].
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function postObjetoPerdido(req, res, next) {
  try {
    if (!req.files?.length)
      return res.status(400).json({
        error: 'Error de validación en los datos enviados',
        detalles: [{ campo: 'fotos', mensaje: 'Debe subir al menos una foto del objeto' }]
      });

    const encargado = await buscarEncargadoSesion(req, res);
    if (!encargado) return;

    const objeto = await services.crear({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      idsEtiquetas: req.body.etiquetas,
      valioso: req.body.valioso,
      urlsFotos: req.files.map((archivo) => archivo.filename),
      idOficina: encargado.idOficina
    });
    res.status(201).json(objeto);
  } catch (err) {
    if (err.statusCode)
      return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}

/**
 * Lista los objetos de la oficina del encargado autenticado.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const getObjetosOficina = async (req, res) => {
  try {
    const encargado = await buscarPorRut(req.user.rut);
    if(!encargado)
      return res.status(401).json({"error": "El usuario no es válido"});
    return res.json(await services.listar({...req.vQuery, idOficina: encargado.idOficina}));
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};

/**
 * Lista los objetos de la oficina del encargado autenticado.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const getObjetoPerdido = async (req, res) => {
  try {
    const objeto = await services.buscarPorId(req.params.id);
    return res.json(objeto);
  } catch (error) {
    console.error('Error fetching object:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};

/**
 * Lista los objetos de la oficina del encargado autenticado.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const putObjetoPerdido = async (req, res) => {
  try {
    const encargado = await buscarEncargadoSesion(req, res);
    if(!encargado) return;
    const objeto = await services.buscarPorId(req.params.id);
    if(objeto.idOficina !== encargado.idOficina || objeto.idEstado !== 1)
      return res.status(403).json({ error: 'No tiene permisos para actualizar este objeto' });
    return res.json(await services.actualizar(req.params.id, {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      idsEtiquetas: req.body.etiquetas,
      idsFotosAConservar: req.body.fotosOriginales,
      urlsFotosNuevas: req.files.map((archivo) => archivo.filename),
    }));
  } catch (error) {
    console.error('Error fetching object:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};

/**
 * Lista los objetos de la oficina del encargado autenticado.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const deleteObjetoPerdido = async (req, res) => {
  try {
    const encargado = await buscarEncargadoSesion(req, res);
    if(!encargado) return;
    const objeto = await services.buscarPorId(req.params.id);
    if(objeto.idOficina !== encargado.idOficina || objeto.idEstado !== 1)
      return res.status(403).json({ error: 'No tiene permisos para eliminar este objeto' });
    return res.json(await services.eliminar(req.params.id));
  } catch (error) {
    console.error('Error fetching object:', error);
    res.status(500).json({ error: 'Error al obtener objetos perdidos' });
  }
};
