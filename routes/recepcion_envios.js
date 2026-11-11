// routes/recepcion_envios.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: documentos por programa y estado
router.get('/programa/:programa/estado/:estado', async (req, res) => {
  const { programa, estado } = req.params;

  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('programa', programa)
    .eq('estado', estado)
    .order('numero_documento', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// GET: pendientes por programa
router.get('/pendientes/:programa', async (req, res) => {
  const { programa } = req.params;

  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('programa', programa)
    .eq('estado', 'P')
    .order('numero_documento', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// GET: recibidos por programa
router.get('/recibidos/:programa', async (req, res) => {
  const { programa } = req.params;

  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('programa', programa)
    .eq('estado', 'R')
    .order('numero_documento', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// GET: documentos por nota de traslado
router.get('/nota/:nota_traslado', async (req, res) => {
  const { nota_traslado } = req.params;

  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('nota_traslado', nota_traslado)
    .order('numero_documento', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// PUT: recibir documento
router.put('/recepcion/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion, nota_traslado } = req.body;

  const { data, error } = await supabase
    .from('detalle_envios')
    .update({estado: 'R', descripcion, nota_traslado})
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// PUT: rechazar documento
router.put('/rechazo/:id', async (req, res) => {
  const { id } = req.params;
  const { descripcion, nota_traslado } = req.body;

  const { data, error } = await supabase
    .from('detalle_envios')
    .update({estado: 'N',descripcion, nota_traslado})
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

export default router;