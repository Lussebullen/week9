// src/schemas.ts
import { z } from 'zod';

//protect the id:s (mongoDB style)
export const idParamSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

// Authors
export const createAuthorSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
  })
  .strict();

export const updateAuthorSchema = createAuthorSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'at least one field is required');

// Books
export const createBookSchema = z
  .object({
    title: z.string().trim().max(50).optional(),
    genre: z.string().trim().max(50).optional(),
    publishedYear: z.number().int().optional(),
    author: idParamSchema.optional(),
  })
  .strict();

export const updateBookSchema = createBookSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'at least one field is required');


