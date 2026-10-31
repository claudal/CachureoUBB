import {z} from 'zod';
import rutjs from 'rut.js';

export const LoginEncargadoSchema = z.object({
    rut: z.string().refine((rut) => rutjs.validate(rut),{error: "El rut de autenticación debe ser válido"}).transform((rut) => rutjs.format(rut,{dots: true})),
    clave: z.string().min(6,{error: "La clave debe tener, como mínimo, 6 carácteres"}).min(6,{error: "La clave debe tener, como máximo, 255 carácteres"})
});