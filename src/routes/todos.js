import { Router } from 'express';
import Todo from '../models/Todo.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Todo.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title_required' });
    }
    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, done } = req.body;
    const updated = await Todo.findByIdAndUpdate(
      id,
      { $set: { ...(title !== undefined ? { title } : {}), ...(done !== undefined ? { done } : {}) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'not_found' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Todo.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;