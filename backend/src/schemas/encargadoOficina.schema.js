import {z} from 'zod';
import { limpiar, validar } from '../utils/rut.utils.js';

export const crearEncargadoOficinaSchema = z.object({
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

// edicion completa: solo se pueden modificar el correo de contacto y la oficina
export const editarEncargadoOficinaSchema = z.object({
  correoContacto: z.email({ message: "El correo debe ser válido" }),
  idOficina: z
    .number({ error: "Debe seleccionar una oficina"}).int()
});

// solo se permite habilitar (1) o deshabilitar (3), el estado pendiente (2) lo maneja el sistema
export const cambiarEstadoEncargadoOficinaSchema = z.object({
  idEstado: z.union([z.literal(1), z.literal(3)], { error: "El estado debe ser habilitado o deshabilitado" })
});

export const parametroEncargadoOficinaSchema = z.object({
  rut: z.string({error: "El rut no debe estar vacío"})
    .refine(validar,{error: "El rut debe ser válido"})
    .transform(limpiar)
})

export const filtroEncargadoOficinaSchema = z.object({
  nombre: z.string().trim().optional(),
  rut: z.string({error: "El rut no debe estar vacío"})
      .refine(validar,{error: "El rut de autenticación debe ser válido"})
      .transform(limpiar).optional(),
  idCampus: z.string().regex(/^\d+$/).transform(Number).optional(),
  idOficina: z.string().regex(/^\d+$/).transform(Number).optional(),
  idEstado: z.string().regex(/^\d+$/).transform(Number).optional(),
  salto: z.string().regex(/^\d+$/).transform(Number).optional().default(0),
  cantidad: z.string().regex(/^\d+$/).transform(Number).optional().default(15)
});