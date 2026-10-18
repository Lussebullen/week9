// src/index.ts
import express from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { env } from './env.js';
import { connectDb } from './db.js';
import { Author } from '../models/author.js';
import { Book } from '../models/books.js';
import {
  idParamSchema,
  createAuthorSchema,
  updateAuthorSchema,
  createBookSchema,
  updateBookSchema,
} from './schemas.js';

const app = express();
app.use(express.json());

//To prevent info leaking to attackers/hackers use this setup, with detailed info to us, in the console, 
// and generic info (stauts(500)) to the client side
function serverError(res: Response, err: unknown) {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
}

/* ---------------------------- AUTHORS ---------------------------- */

app.get('/authors', async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    serverError(res, err);
  }
});

app.get('/authors/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const author = await Author.findById(parsedId.data);
    if (!author) {
      return res.status(404).json({ error: 'author not found' });
    }
    res.json(author);
  } catch (err) {
    serverError(res, err);
  }
});

app.post('/authors', async (req, res) => {
  const parsedBody = createAuthorSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: z.treeifyError(parsedBody.error) });
  }

  try {
    const newAuthor = await Author.create(parsedBody.data);
    res.status(201).json(newAuthor);
  } catch (err) {
    serverError(res, err);
  }
});

app.put('/authors/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  const parsedBody = updateAuthorSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: z.treeifyError(parsedBody.error) });
  }

  try {
    const updatedAuthor = await Author.findByIdAndUpdate(parsedId.data, parsedBody.data, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updatedAuthor) {
      return res.status(404).json({ error: 'author not found' });
    }
    res.json(updatedAuthor);
  } catch (err) {
    serverError(res, err);
  }
});

// Mimics ON DELETE RESTRICT: refuse if the author still has books
app.delete('/authors/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const hasBooks = await Book.exists({ author: parsedId.data });
    if (hasBooks) {
      return res.status(409).json({ error: 'author still has books' });
    }

    const deletedAuthor = await Author.findByIdAndDelete(parsedId.data);
    if (!deletedAuthor) {
      return res.status(404).json({ error: 'author not found' });
    }
    res.json({ message: 'Author deleted', author: deletedAuthor });
  } catch (err) {
    serverError(res, err);
  }
});

/* ----------------------------- BOOKS ----------------------------- */

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find().populate('author');
    res.json(books);
  } catch (err) {
    serverError(res, err);
  }
});

app.get('/books/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const book = await Book.findById(parsedId.data).populate('author');
    if (!book) {
      return res.status(404).json({ error: 'book not found' });
    }
    res.json(book);
  } catch (err) {
    serverError(res, err);
  }
});

app.post('/books', async (req, res) => {
  const parsedBody = createBookSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: z.treeifyError(parsedBody.error) });
  }

  try {
    // MongoDB doesn't enforce references, so check the author exists
    if (parsedBody.data.author) {
      const authorExists = await Author.exists({ _id: parsedBody.data.author });
      if (!authorExists) {
        return res.status(400).json({ error: 'author does not exist' });
      }
    }

    const newBook = await Book.create(parsedBody.data);
    res.status(201).json(newBook);
  } catch (err) {
    serverError(res, err);
  }
});

app.put('/books/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  const parsedBody = updateBookSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: z.treeifyError(parsedBody.error) });
  }

  try {
    if (parsedBody.data.author) {
      const authorExists = await Author.exists({ _id: parsedBody.data.author });
      if (!authorExists) {
        return res.status(400).json({ error: 'author does not exist' });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(parsedId.data, parsedBody.data, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('author');

    if (!updatedBook) {
      return res.status(404).json({ error: 'book not found' });
    }
    res.json(updatedBook);
  } catch (err) {
    serverError(res, err);
  }
});

app.delete('/books/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const deletedBook = await Book.findByIdAndDelete(parsedId.data);
    if (!deletedBook) {
      return res.status(404).json({ error: 'book not found' });
    }
    res.json({ message: 'Book deleted', book: deletedBook });
  } catch (err) {
    serverError(res, err);
  }
});

await connectDb();

app.listen(env.APP_PORT, () => {
  console.log(`Server is running on port ${env.APP_PORT}...`);
});