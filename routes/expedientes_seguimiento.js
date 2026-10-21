// routes/expedientes_seguimiento.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET expedientes por id_carga
router.get('/:id_carga', async (req, res) => {
  const { id_carga } = req.params;
  const { data, error } = await supabase
    .from('expedientes_seguimiento')
    .select('*')
    .eq('id_carga', id_carga)
    .order('rub');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// POST nuevo expediente seguimiento (uno o varios)
router.post('/', async (req, res) => {
  const body = req.body;

  // Si viene un array, lo insertamos tal cual
  const registros = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase
    .from('expedientes_seguimiento')
    .insert(registros);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// PUT actualizar expediente seguimiento (estatus y nota_traslado)
router.put('/:id_carga/:rub', async (req, res) => {
  const { id_carga, rub } = req.params;
  const { estatus, nota_traslado } = req.body;

  const { data, error } = await supabase
    .from('expedientes_seguimiento')
    .update({estatus, nota_traslado, updated_at: new Date().toISOString()})
    .eq('id_carga', id_carga)
    .eq('rub', rub);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, data });
});

// DELETE eliminar expediente seguimiento
router.delete('/:id_carga/:rub', async (req, res) => {
  const { id_carga, rub } = req.params;
  const { error } = await supabase
    .from('expedientes_seguimiento')
    .delete()
    .eq('id_carga', id_carga)
    .eq('rub', rub);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Expediente eliminado' });
});

export default router;