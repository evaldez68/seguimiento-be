// routes/seguimiento_historial.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// Historial completo 
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Historial completo por número de documento
router.get('/historial/:numero', async (req, res) => {
  const { numero } = req.params;
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*')
    .eq('numero_documento', numero)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true });

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;