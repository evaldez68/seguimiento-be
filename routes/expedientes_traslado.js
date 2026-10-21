// routes/expedientes_traslado.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET todos los expedientes traslado
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('expedientes_traslado')
    .select('*')
    .order('id_carga', { ascending: true })
    .order('rub', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET expedientes traslado filtrados por id_carga
router.get('/:id_carga', async (req, res) => {
  const { id_carga } = req.params;
  const { data, error } = await supabase
    .from('expedientes_traslado')
    .select('*')
    .eq('id_carga', id_carga)
    .order('rub', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET expedientes traslado filtrados por id_carga, departamento
router.get('/:id_carga/:departamento', async (req, res) => {
  const { id_carga, departamento } = req.params;
  const { data, error } = await supabase
    .from('expedientes_traslado')
    .select('*')
    .eq('id_carga', id_carga)
    .ilike('departamento', departamento)
    .order('rub', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET expedientes traslado filtrados por id_carga, departamento y municipio
router.get('/:id_carga/:departamento/:municipio', async (req, res) => {
  const { id_carga, departamento, municipio } = req.params;
  const { data, error } = await supabase
    .from('expedientes_traslado')
    .select('*')
    .eq('id_carga', id_carga)
    .ilike('departamento', departamento)
    .ilike('municipio', municipio)
    .order('rub', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;