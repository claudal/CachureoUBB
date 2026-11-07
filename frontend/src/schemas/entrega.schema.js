import { z } from 'zod';
import { limpiar, validar } from '../utils/rut.utils.js';
import { TAMANO_MAXIMO_FOTO_MB, esImagenPermitida, esTamanoFotoValido } from './objetoPerdido.schema.js';

// mismas reglas que backend/src/schemas/entrega.schema.js
export const MAXIMO_FOTOS_ENTREGA = 1;

// un campo de texto vacio se trata como si no viniera
const textoOpcional = (maximo, campo) => z
  .string()
  .trim()
  .max(maximo, { error: `${campo} debe tener a lo más ${maximo} carácteres` })
  .optional()
  .transform((valor) => valor || undefined);

/**
 * Schema del formulario de entrega. Depende del objeto: si es valioso exige
 * una caracteristica que solo el dueño conoceria o una foto de verificacion.
 * @param {{valioso?: boolean}} objeto
 */
export const crearRegistrarEntregaSchema = ({ valioso = false } = {}) => z.object({
  rutReclamante: z
    .string({ error: "El RUT del reclamante es obligatorio" })
    .trim()
    // abort: si está vacio no sigue al mensaje de "RUT invalido"
    .min(1, { error: "El RUT del reclamante es obligatorio", abort: true })
    .refine(validar, { error: "El RUT del reclamante debe ser válido" })
    .transform(limpiar),
  nombreReclamante: z
    .string({ error: "El nombre del reclamante es obligatorio" })
    .trim()
    .min(3, { error: "El nombre del reclamante debe tener al menos 3 carácteres" })
    .max(150, { error: "El nombre del reclamante debe tener a lo más 150 carácteres" }),
  caracteristicaVerificacion: textoOpcional(1000, "La característica de verificación"),
  comentarios: textoOpcional(1000, "Los comentarios"),
  fotos: z
    .array(z.instanceof(File))
    .max(MAXIMO_FOTOS_ENTREGA, { error: `Puede subir como máximo ${MAXIMO_FOTOS_ENTREGA} foto` })
    .refine((fotos) => fotos.every(esImagenPermitida), {
      error: "Solo se permiten imágenes JPG, PNG, WEBP o HEIC"
    })
    .refine((fotos) => fotos.every(esTamanoFotoValido), {
      error: `La foto debe pesar como máximo ${TAMANO_MAXIMO_FOTO_MB} MB`
    })
    .default([])
}).refine(
  (datos) => !valioso || Boolean(datos.caracteristicaVerificacion?.trim()) || datos.fotos?.length > 0,
  {
    path: ['caracteristicaVerificacion'],
    error: "El objeto es de valor: ingrese una característica que solo el dueño conocería o una foto de verificación",
    // se revisa aunque otro campo tenga error, asi el formulario muestra todos los errores juntos
    when: () => true
  }
);
