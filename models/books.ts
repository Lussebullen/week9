// src/models/book.ts
import mongoose from 'mongoose';

//author_id REFERENCES authors(id) becomes author with ref: 'Author'. 
// With this, Book.find().populate('author') gives you the full author document, similar to a JOIN.
const bookSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 50 },
  genre: { type: String, trim: true, maxlength: 50 },
  publishedYear: {
    type: Number,
    validate: { validator: Number.isInteger, message: 'publishedYear must be an integer' },
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
});

export const Book = mongoose.model('Book', bookSchema);