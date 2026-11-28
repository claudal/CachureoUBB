import { z } from 'zod';
import { esImagenPermitida, esTamanoFotoValido } from './objetoPerdido.schema.js';

// mismas reglas que backend/src/schemas/oficina.schema.js (de acuerdo al req func)
export const MAXIMO_FOTOS_OFICINA = 1;

export const OficinaSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(100, { error: "El nombre debe tener a lo más 100 carácteres" }),
  descripcion: z
    .string({ error: "La descripción es obligatoria" })
    .trim()
    .min(5, { error: "La descripción debe tener al menos 5 carácteres" })
    .max(500, { error: "La descripción debe tener a lo más 500 carácteres" }),
  idCampus: z
    .number({ error: "Debe seleccionar un campus" })
    .int({ error: "Debe seleccionar un campus" }),
  // una sola foto: un File recien elegido o la foto ya guardada de la oficina
  fotos: z
    .array(z.union([z.instanceof(File), z.object({ id: z.number(), url: z.string() })]), { error: "Debe subir una foto de la oficina" })
    .min(1, { error: "Debe subir una foto de la oficina" })
    .max(MAXIMO_FOTOS_OFICINA, { error: "Solo puede subir una foto de la oficina" })
    .refine((fotos) => fotos.every(esImagenPermitida), {
      error: "Solo se permiten imágenes JPG, PNG, WEBP o HEIC"
    })
    .refine((fotos) => fotos.every(esTamanoFotoValido), {
      error: "La foto debe pesar como máximo 5 MB"
    })
});
