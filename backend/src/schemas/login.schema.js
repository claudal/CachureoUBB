import { z } from 'zod';
import rutjs from 'rut.js'


export const loginSchema = z.object({
  rut: z.string({error: "El rut no debe estar vacío"}).refine((rut) => rutjs.validate(rut),{error: "El rut de autenticación debe ser válido"}),
  contrasena: z
    .string({error: "La contraseña no debe estar vacía"})
    .min(6,{error: "La contraseña debe tener al menos 6 carácteres"})
    .max(72, {error: "La contraseña debe tener a lo más 72 carácteres"})
});