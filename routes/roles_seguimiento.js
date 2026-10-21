// routes/roles_seguimiento.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar todos los roles
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('roles_seguimiento')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET: obtener un rol por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('roles_seguimiento')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST: crear un nuevo rol
router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;
  const { data, error } = await supabase
    .from('roles_seguimiento')
    .insert([{ nombre, descripcion }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;