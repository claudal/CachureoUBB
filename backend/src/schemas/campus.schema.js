import { z } from 'zod';

export const parametroCampusSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
})