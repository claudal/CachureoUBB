import { z } from 'zod';

// Los campos llegan como texto porque el formulario se envía como multipart/form-data (por las fotos).
export const crearObjetoPerdidoSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(150, { error: "El nombre debe tener a lo más 150 carácteres" }),
  descripcion: z
    .string({ error: "La descripción es obligatoria" })
    .trim()
    .min(5, { error: "La descripción debe tener al menos 5 carácteres" })
    .max(2000, { error: "La descripción debe tener a lo más 2000 carácteres" }),
  // un solo valor llega como string y varios como arreglo
  etiquetas: z.preprocess(
    (val) => (val === undefined || Array.isArray(val) ? val : [val]),
    z.array(
        z.string().regex(/^\d+$/, { error: "Las etiquetas deben ser identificadores numéricos" }).transform(Number),
        { error: "Debe seleccionar al menos una etiqueta" }
      )
      .min(1, { error: "Debe seleccionar al menos una etiqueta" })
      .transform((ids) => [...new Set(ids)])
  ),
  valioso: z
    .enum(['true', 'false'], { error: "El valor de valioso debe ser booleano" })
    .optional()
    .transform((valor) => valor === 'true')
});
