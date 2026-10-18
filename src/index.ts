import express from 'express';
import mongoose from 'mongoose';
import z from 'zod';
import { env } from './env.js';
import { connectDb } from './db.js';
import { updateItemSchema, idParamSchema, createItemSchema } from './schemas.js';

//Note on try-catch
//The catch logs the real error for me in the terminal but sends the client a generic 500, so internal details (like connection strings or stack traces) don’t leak.
//Seems to be a security issue

const app = express();
app.use(express.json());

const itemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
});

const Item = mongoose.model('Item', itemSchema);

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/items', async (req, res) => {
  const parsed = createItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.treeifyError(parsed.error) });
  }

  try {
    const newItem = new Item(parsed.data);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.put('/items/:id', async (req, res) => {
  const parsedBody = updateItemSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: z.treeifyError(parsedBody.error) });
  }

  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(parsedId.data, parsedBody.data, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ error: 'item not found' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.delete('/items/:id', async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const deletedItem = await Item.findByIdAndDelete(parsedId.data);

    if (!deletedItem) {
      return res.status(404).json({ error: 'item not found' });
    }

    res.json({ message: 'Item deleted', item: deletedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

await connectDb();

app.listen(env.APP_PORT, () => {
  console.log(`Server is running on port ${env.APP_PORT}...`);
});