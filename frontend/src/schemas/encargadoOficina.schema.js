import {z} from 'zod';
import { limpiar, validar } from '../utils/rut.utils.js';

export const CrearEncargadoOficinaSchema = z.object({
  rut: z.string({error: "El rut no debe estar vacío"})
      .refine(validar,{error: "El rut de autenticación debe ser válido"})
      .transform(limpiar),
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(150, { error: "El nombre debe tener a lo más 150 carácteres" }),
  correoContacto: z.email({ message: "El correo debe ser válido" }),
  idOficina: z
    .number({ error: "Debe seleccionar una oficina"}).int()
});

// al editar solo se pueden cambiar el correo de contacto y la oficina
export const EditarEncargadoOficinaSchema = CrearEncargadoOficinaSchema.pick({
  correoContacto: true,
  idOficina: true
});

export const FiltroEncargadoOficinaSchema = z.object({
  nombre: z.string().trim(),
  // el rut es opcional, pero si se ingresa debe ser valido
  rut: z.string()
      .trim()
      .refine((rut)=>rut === "" || validar(rut),{error: "El rut debe ser válido"})
      .transform((rut)=>rut && limpiar(rut)),
  idOficina: z.number().int().nullable()
});