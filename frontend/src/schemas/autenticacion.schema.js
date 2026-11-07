import {z} from 'zod';
import { limpiar, validar } from '../utils/rut.utils.js';

export const LoginEncargadoSchema = z.object({
    rut: z.string({error: "El rut no debe estar vacío"})
    .refine(validar,{error: "El rut de autenticación debe ser válido"})
    .transform(limpiar),
    clave: z.string({error: "La contraseña no debe estar vacía"}).min(6,{error: "La clave debe tener, como mínimo, 6 carácteres"}).min(6,{error: "La clave debe tener, como máximo, 255 carácteres"})
});

export const LoginAdministradorSchema = z.object({
  // acepta formato de correo
  correo: z.email({error: "El correo debe ser válido"}),
  clave: z
    .string({error: "La contraseña no debe estar vacía"})
    .min(6,{error: "La contraseña debe tener al menos 6 carácteres"})
    .max(72, {error: "La contraseña debe tener a lo más 72 carácteres"})
});