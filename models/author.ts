// src/models/author.ts
import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
});

export const Author = mongoose.model('Author', authorSchema);