import { z } from 'zod';

// mismas reglas que backend/src/schemas/objetoPerdido.schema.js y backend/src/config/upload.js
export const MAXIMO_FOTOS_OBJETO = 5;
export const TAMANO_MAXIMO_FOTO_MB = 5;
export const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// algunos navegadores (Windows/Android) no reconocen HEIC y dejan el tipo vacío
const EXTENSIONES_HEIC = /\.(heic|heif)$/i;
const esImagenPermitida = (archivo) =>
  archivo instanceof File ?
  TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type) || EXTENSIONES_HEIC.test(archivo.name) :
  true // foto existente;
const esTamanoFotoValido = (archivo) =>
  archivo instanceof File ?
  archivo.size <= TAMANO_MAXIMO_FOTO_MB * 1024 * 1024 :
  true // foto existente;

export const RegistrarObjetoSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(150, { error: "El nombre debe tener a lo más 150 carácteres" }),
  descripcion: z
    .string({ error: "La descripción es obligatoria" })
    .trim()
    .min(5, { error: "La descripción debe tener al menos 5 carácteres" })
    .max(500, { error: "La descripción debe tener a lo más 500 carácteres" }),
  etiquetas: z
    .array(z.number().int(), { error: "Debe seleccionar al menos una etiqueta" })
    .min(1, { error: "Debe seleccionar al menos una etiqueta" }),
  valioso: z.boolean(),
  fotos: z
    .array(z.union([z.instanceof(File), z.object({ id: z.number(), url: z.string() })]), { error: "Debe subir al menos una foto del objeto" })
    .min(1, { error: "Debe subir al menos una foto del objeto" })
    .max(MAXIMO_FOTOS_OBJETO, { error: `Puede subir como máximo ${MAXIMO_FOTOS_OBJETO} fotos` })
    .refine((fotos) => fotos.every(esImagenPermitida), {
      error: "Solo se permiten imágenes JPG, PNG, WEBP o HEIC"
    })
    .refine((fotos) => fotos.every((foto) => esTamanoFotoValido(foto)), {
      error: `Cada foto debe pesar como máximo ${TAMANO_MAXIMO_FOTO_MB} MB`
    })
});