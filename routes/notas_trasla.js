// routes/vw_notas_trasla.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET /notas_trasla
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vw_notas_trasla')
      .select('nota_traslado, registros');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notas_trasla
router.get('/:nota', async (req, res) => {
  try {
    const { nota } = req.params;
    const { data, error } = await supabase
      .from('vw_notas_trasla')
      .select('nota_traslado, registros')
      .eq('nota_traslado', nota);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET expedientes traslado filtrados por id_carga
router.get('/expedientes/:nota', async (req, res) => {
  const { nota } = req.params;
  const { data, error } = await supabase
    .from('expedientes_traslado')
    .select('*')
    .eq('nota_traslado', nota)
    .order('rub', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// PUT actualizar expediente seguimiento (estatus)
router.put('/expediente_update/:nota/:rub', async (req, res) => {
  const { nota, rub } = req.params;
  const { estatus } = req.body;

  const { data, error } = await supabase
    .from('expedientes_seguimiento')
    .update({estatus, updated_at: new Date().toISOString()})
    .eq('nota_traslado', nota)
    .eq('rub', rub);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});


export default router;
