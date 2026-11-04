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
    .max(500, { error: "La descripción debe tener a lo más 500 carácteres" }),
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
export const filtroObjetoOficinaSchema = z.object({
  idEstado: z.string().regex(/^\d+$/).transform(Number).optional(),
  etiquetaObjeto: z.preprocess((val) => {
      return Array.isArray(val) ? val : [val];
    }, z.array(z.string().regex(/^\d+$/).transform(Number)))
    .optional(),
  nombre: z.string().optional(),
  fechaIngreso: z.iso.datetime({error:"La fecha de ingreso debe ser válida" }).optional(),
  palabrasClave: z.string().optional(),
  valioso: z.enum(['true','false'],{error: "El valor del parámetro debe ser booleano"}).transform((valor) => valor === 'true').optional()
});

export const parametroAlertaBusquedaSchema = z.object({
  id: z.uuid({error: "El identificador debe tener formato UUID"})
})
