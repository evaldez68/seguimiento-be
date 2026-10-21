// routes/seguimiento_consulta.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET de todas las filas
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*');

  if (error) return res.status(400).json({ error });
  res.json(data);
});

router.get('/documento/:numero', async (req, res) => {
  const { numero } = req.params;
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*')
    .eq('numero_documento', numero);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET por número de documento
router.get('/documento/:numero', async (req, res) => {
  const { numero } = req.params;
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*')
    .eq('numero_documento', numero);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// GET por correlativo
router.get('/correlativo/:coti', async (req, res) => {
  const { coti } = req.params;
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*')
    .eq('correlativo', coti);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;