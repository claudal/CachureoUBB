import { z } from 'zod';

export const filtroObjetoOficinaSchema = z.object({
  idEstado: z.string().regex(/^\d+$/).transform(Number).optional(),
  etiquetaObjeto: z.preprocess((val) => {
      return Array.isArray(val) ? val : [val];
    }, z.array(z.string().regex(/^\d+$/).transform(Number)))
    .optional(),
  nombre: z.string().optional(),
  palabrasClave: z.string().optional(),
  esValioso: z.enum(['true','false'],{error: "El valor del parámetro debe ser booleano"}).transform((valor) => valor === 'true').optional()
});

export const parametroAlertaBusquedaSchema = z.object({
  id: z.uuid({error: "El identificador debe tener formato UUID"})
})