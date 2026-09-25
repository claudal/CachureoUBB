import { z } from 'zod';
import rutjs from 'rut.js'

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

export const filtroAlertaBusquedaSchema = z.object({
  id_estado: z.string().regex(/^\d+$/).transform(Number).optional(),
  rut_autor: z.string().refine((rut) => rutjs.validate(rut),{error: "El rut del autor debe ser válido"}).optional()
});