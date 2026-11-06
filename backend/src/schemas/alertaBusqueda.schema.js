import { z } from 'zod';

/*TODO
export const createAnimalSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio').max(100),
  edad: z.number().int().nonnegative('La edad no puede ser negativa'),
  peso: z.number().positive().optional(),
  disponible: z.boolean().default(true),
  especieId: z.number().int().positive('Debe indicar una especie válida'),
  recintoId: z.number().int().positive('Debe indicar un recinto válido'),
});

export const updateAnimalSchema = createAnimalSchema.partial();*/

// Los campos llegan como texto porque el formulario se envía como multipart/form-data (por las fotos).
export const crearAlertaBusquedaSchema = z.object({
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
      .transform((ids) => [...new Set(ids)]).optional().default([])
  ),
  idCampus: z.string().regex(/^\d+$/).transform(Number),
});

export const filtroAlertaBusquedaSchema = z.object({
  idEstado: z.string().regex(/^\d+$/).transform(Number).optional(),
  etiquetaObjeto: z.preprocess((val) => { 
      return Array.isArray(val) ? val : [val];
    }, z.array(z.string().regex(/^\d+$/).transform(Number)))
    .optional(),
  nombre: z.string().optional(),
  palabrasClave: z.string().optional(),
  marcado: z.enum(['true','false'],{error: "El valor del parámetro debe ser booleano"}).transform((valor) => valor === 'true').optional()
});

export const crearSolicitudDetallesSchema = z.object({
  indicaciones: z
  .string({ error: "La indicación es obligatoria" })
  .trim()
  .min(10, { error: "La indicación debe tener al menos 10 carácteres" })
  .max(500, { error: "La descripción debe tener a lo más 500 carácteres" }),
});

export const parametroAlertaBusquedaSchema = z.object({
  id: z.uuid({error: "El identificador debe tener formato UUID"})
})