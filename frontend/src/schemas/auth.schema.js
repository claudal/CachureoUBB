import {z} from 'zod';
import rutjs from 'rut.js';

export const LoginEncargadoSchema = z.object({
    // se envía sin puntos ni guion ("123456789"), igual que se guarda en la BD
    rut: z.string().refine((rut) => rutjs.validate(rut),{error: "El rut de autenticación debe ser válido"}).transform((rut) => rutjs.clean(rut)),
    clave: z.string().min(6,{error: "La clave debe tener, como mínimo, 6 carácteres"}).max(72,{error: "La clave debe tener, como máximo, 72 carácteres"})
});