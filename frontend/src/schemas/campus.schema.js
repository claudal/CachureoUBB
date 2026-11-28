import { z } from 'zod';

// mismas reglas que el backend (campusSchema)
export const CampusSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 carácteres" })
    .max(100, { error: "El nombre debe tener a lo más 100 carácteres" }),
  direccion: z
    .string({ error: "La dirección es obligatoria" })
    .trim()
    .min(5, { error: "La dirección debe tener al menos 5 carácteres" })
    .max(255, { error: "La dirección debe tener a lo más 255 carácteres" })
});
