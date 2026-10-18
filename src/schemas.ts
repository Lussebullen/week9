import { z } from 'zod';

export const updateItemSchema = z.object({
  name: z.string().optional(),
  qty: z.int().min(1, { message:'The quantity must be at least 1' }),
}).strict();

export const createItemSchema = z.object({
  name: z.string(),
  qty: z.number().int().min(1, { message:'The quantity must be at least 1' }),
}).strict();

export const librarySchema_Books = z.object({
  title: z
    .string().min(2, { message: 'Title must be at least 2 characters long' })
    .max(50, { message: 'Title must be less than 50 characters' }),
  genre: z
    .string().min(2, { message: 'Genre is required' })
    .max(50, { message: 'Genre must be less than 50 characters' }),
  published_year: z
    .number().int().min(-20000, { message: 'Published year could be negative if the book is an old document like \'The art of War\' by Sun Tzu, but it must be a whole number' }),
  author_id: z
    .number().int().min(1, { message: 'Author ID must be a positive integer' }),
});

export const librarySchema_Authors = z.object({
  name: z
    .string().min(2, { message: 'Author name is required' })
    .max(50, { message: 'Author name must be less than 50 characters' }),
});

//PATCH needs a partial schema
//If PATCH reuses librarySchema_Books, a schema that requires all four fields, 
// a PATCH with only { "genre": "Fantasy" } fails with a 400 before the COALESCE query runs.
export const librarySchema_BooksPatch = librarySchema_Books
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

//protect the id:s (mongoDB style)
export const idParamSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

