import { z } from 'zod';
import rutjs from 'rut.js';

// en multipart/form-data un campo vacío llega como "", se trata igual que si no viniera
const textoOpcional = (maximo, campo) => z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string()
    .trim()
    .max(maximo, { error: `${campo} debe tener a lo más ${maximo} carácteres` })
    .optional()
);

// Los campos llegan como texto porque el formulario se envía como multipart/form-data (por la foto opcional).
export const registrarEntregaSchema = z.object({
  // acepta cualquier formato (con o sin puntos/guion) y lo deja como se guarda en la BD: "123456789"
  rutReclamante: z
    .string({ error: "El RUT del reclamante es obligatorio" })
    .trim()
    .refine((rut) => rutjs.validate(rut), { error: "El RUT del reclamante debe ser válido" })
    .transform((rut) => rutjs.clean(rut)),
  nombreReclamante: z
    .string({ error: "El nombre del reclamante es obligatorio" })
    .trim()
    .min(3, { error: "El nombre del reclamante debe tener al menos 3 carácteres" })
    .max(150, { error: "El nombre del reclamante debe tener a lo más 150 carácteres" }),
  // obligatoria (o una foto) solo si el objeto es valioso; eso se revisa en el servicio
  caracteristicaVerificacion: textoOpcional(1000, "La característica de verificación"),
  comentarios: textoOpcional(1000, "Los comentarios")
});
