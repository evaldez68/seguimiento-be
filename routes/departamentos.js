// routes/departamentos.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET todos los departamentos
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('departamentos').select('*').order('id_departamento');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// POST nuevo departamento
router.post('/', async (req, res) => {
  const { nombre, region } = req.body;
  const { data, error } = await supabase.from('departamentos').insert([{ nombre, region }]);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// PUT actualizar departamento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, region } = req.body;
  const { data, error } = await supabase.from('departamentos')
    .update({ nombre, region })
    .eq('id_departamento', id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// DELETE eliminar departamento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('departamentos').delete().eq('id_departamento', id);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Departamento eliminado' });
});

export default router;