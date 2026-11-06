import multer from "multer";
import path from "path";
import { unlink } from "fs/promises";
import {
  UPLOAD_DIR,
  TIPOS_IMAGEN_PERMITIDOS,
  TAMANO_MAXIMO_FOTO_MB,
  MAXIMO_FOTOS
} from "../config/upload.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${suffix}${ext}`);
  }
});

export const upload = multer({ storage });

const uploadImagenes = multer({
  storage,
  limits: { fileSize: TAMANO_MAXIMO_FOTO_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (TIPOS_IMAGEN_PERMITIDOS.includes(file.mimetype))
      return cb(null, true);
    const err = new Error("Solo se permiten imágenes JPG, PNG, WEBP o HEIC");
    err.code = TIPO_NO_PERMITIDO;
    cb(err);
  }
});

const TIPO_NO_PERMITIDO = "TIPO_NO_PERMITIDO";

const MENSAJES_ERROR = {
  LIMIT_FILE_SIZE: () => `Cada foto debe pesar como máximo ${TAMANO_MAXIMO_FOTO_MB} MB`,
  LIMIT_FILE_COUNT: () => "Se subieron demasiados archivos",
  // multer usa este código cuando se pasa del máximo del campo o el campo no es el esperado
  LIMIT_UNEXPECTED_FILE: (campo, maximo) => `Se pueden subir como máximo ${maximo} fotos en el campo "${campo}"`,
  [TIPO_NO_PERMITIDO]: () => "Solo se permiten imágenes JPG, PNG, WEBP o HEIC"
};

/**
 * Borra del disco los archivos subidos en la petición (si los hay).
 * @param {Express.Multer.File[] | Record<string, Express.Multer.File[]> | undefined} archivos
 */
export async function eliminarArchivos(archivos) {
  if (!archivos) return;
  const lista = Array.isArray(archivos) ? archivos : Object.values(archivos).flat();
  await Promise.all(lista.map((archivo) => unlink(archivo.path).catch(() => {})));
}

/**
 * Si la respuesta termina en error (validación, regla de negocio o error interno),
 * borra las fotos que multer ya guardó, para no dejar archivos huérfanos.
 * @type {import("express").RequestHandler}
 */
function descartarArchivosSiFalla(req, res, next) {
  res.on("finish", () => {
    if (res.statusCode >= 400)
      eliminarArchivos(req.files ?? (req.file && [req.file]));
  });
  next();
}

/**
 * Recibe hasta `maximo` imágenes en el campo `campo` (multipart/form-data)
 * y responde 400 con un mensaje claro si el archivo no es válido.
 * @param {string} campo
 * @param {number} maximo
 * @returns {import("express").RequestHandler[]}
 */
export function subirImagenes(campo, maximo) {
  const recibir = uploadImagenes.array(campo, maximo);
  return [
    descartarArchivosSiFalla,
    (req, res, next) => {
      recibir(req, res, (err) => {
        if (!err) return next();
        if (!(err instanceof multer.MulterError) && err.code !== TIPO_NO_PERMITIDO) return next(err);
        const mensaje = MENSAJES_ERROR[err.code]?.(campo, maximo) ?? err.message;
        return res.status(400).json({
          error: "Error en las fotos enviadas",
          detalles: [{ campo, mensaje }]
        });
      });
    }
  ];
}

export const subirFotos = subirImagenes("fotos", MAXIMO_FOTOS);
// foto de verificación opcional al registrar una entrega
export const subirFotoEntrega = subirImagenes("foto", 1);
