// routes/procesos.js
import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar todos los procesos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('procesos')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET: obtener un proceso por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('procesos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST: crear un nuevo proceso
router.post('/', async (req, res) => {
  const { nombre_proceso, encargado } = req.body;
  const { data, error } = await supabase
    .from('procesos')
    .insert([{ nombre_proceso, encargado }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT: actualizar un proceso por id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_proceso, encargado } = req.body;
  const { data, error } = await supabase
    .from('procesos')
    .update({ nombre_proceso, encargado })
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE: eliminar un proceso por id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('procesos')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Proceso eliminado', data });
});

export default router;