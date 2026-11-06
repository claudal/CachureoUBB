import { z } from 'zod';
import rutjs from 'rut.js'


export const loginEncargadoOficinaSchema = z.object({
  // acepta cualquier formato (con o sin puntos/guion) y lo deja como se guarda en la BD: "123456789"
  rut: z.string({error: "El rut no debe estar vacío"})
    .refine((rut) => rutjs.validate(rut),{error: "El rut de autenticación debe ser válido"})
    .transform((rut) => rutjs.clean(rut)),
  clave: z
    .string({error: "La contraseña no debe estar vacía"})
    .min(6,{error: "La contraseña debe tener al menos 6 carácteres"})
    .max(72, {error: "La contraseña debe tener a lo más 72 carácteres"})
});

export const loginAdministradorSchema = z.object({
  // acepta formato de correo
  correo: z.email({error: "El correo debe ser válido"}),
  clave: z
    .string({error: "La contraseña no debe estar vacía"})
    .min(6,{error: "La contraseña debe tener al menos 6 carácteres"})
    .max(72, {error: "La contraseña debe tener a lo más 72 carácteres"})
});