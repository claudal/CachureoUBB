import { z } from 'zod';

export const parametroOficinaSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
})

export const filtroOficinaSchema = z.object({
  idCampus: z.string().regex(/^\d+$/).transform(Number).optional()
})

// mismos campos para crear y para editar una oficina (edicion completa).
// Llegan como texto porque el formulario se envia como multipart/form-data (por la foto).
export const oficinaSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(100, { error: "El nombre debe tener a lo más 100 carácteres" }),
  descripcion: z
    .string({ error: "La descripción es obligatoria" })
    .trim()
    .min(5, { error: "La descripción debe tener al menos 5 carácteres" })
    .max(500, { error: "La descripción debe tener a lo más 500 carácteres" }),
  idCampus: z
    .string({ error: "Debe seleccionar una sede" })
    .regex(/^\d+$/, { error: "La sede debe ser un identificador numérico" })
    .transform(Number)
});
