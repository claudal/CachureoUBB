import { z } from 'zod';
import { limpiar, validar } from '../utils/rut.utils.js';


export const loginEncargadoOficinaSchema = z.object({
  // acepta cualquier formato (con o sin puntos/guion) y lo deja como se guarda en la BD: "123456789"
  rut: z.string({error: "El rut no debe estar vacío"})
    .refine(validar,{error: "El rut de autenticación debe ser válido"})
    .transform(limpiar),
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

export const restablecerClaveSchema = z.object({
  claveNueva: z
    .string({error: "La contraseña no debe estar vacía"})
    .min(6,{error: "La contraseña debe tener al menos 6 carácteres"})
    .max(72, {error: "La contraseña debe tener a lo más 72 carácteres"}),
  token: z.jwt({error: "El token debe ser válido"})
})