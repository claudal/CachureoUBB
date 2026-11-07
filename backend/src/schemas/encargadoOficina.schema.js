import {z} from 'zod';
import rutjs from 'rut.js';

export const crearEncargadoOficinaSchema = z.object({
  rut: z.string({error: "El rut no debe estar vacío"})
      .refine((rut) => rutjs.validate(rut),{error: "El rut de autenticación debe ser válido"})
      .transform((rut) => rutjs.clean(rut)),
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(150, { error: "El nombre debe tener a lo más 150 carácteres" }),
  correoContacto: z.email({ message: "El correo debe ser válido" })
    .optional()
    .default(""),
  idOficina: z
    .number({ error: "Debe seleccionar una oficina"}).int()
});