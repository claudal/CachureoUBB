import { z } from 'zod';


export const filtroEtiquetaObjetoSchema = z.object({
  valioso: z.refine((val) => val === 'true' || val === 'false', {
      error: "El filtro opcional de valioso debe ser un booleano",
    }).transform((val) => val === 'true').optional()
});