// routes/municipios.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET municipios por departamento
router.get('/:id_departamento', async (req, res) => {
  const { id_departamento } = req.params;
  const { data, error } = await supabase.from('municipios')
    .select('*')
    .eq('id_departamento', id_departamento)
    .order('id_municipio');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// POST nuevo municipio
router.post('/', async (req, res) => {
  const { id_departamento, id_municipio, nombre } = req.body;
  const { data, error } = await supabase.from('municipios')
    .insert([{ id_departamento, id_municipio, nombre }]);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// PUT actualizar municipio
router.put('/:id_departamento/:id_municipio', async (req, res) => {
  const { id_departamento, id_municipio } = req.params;
  const { nombre } = req.body;
  const { data, error } = await supabase.from('municipios')
    .update({ nombre })
    .eq('id_departamento', id_departamento)
    .eq('id_municipio', id_municipio);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// DELETE eliminar municipio
router.delete('/:id_departamento/:id_municipio', async (req, res) => {
  const { id_departamento, id_municipio } = req.params;
  const { error } = await supabase.from('municipios')
    .delete()
    .eq('id_departamento', id_departamento)
    .eq('id_municipio', id_municipio);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Municipio eliminado' });
});

export default router;