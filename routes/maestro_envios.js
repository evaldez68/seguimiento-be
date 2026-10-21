// routes/maestro_envios.js
import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar todos los envíos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('maestro_envios')
    .select('*,coordinaciones_departamentales(departamento,coordinador,direccion_fisica,contacto)')
    .order('fecha', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET: obtener último correlativo
router.get('/ultimo-correlativo', async (req, res) => {
  const { data, error } = await supabase
    .from('maestro_envios')
    .select('correlativo')
    .order('correlativo', { ascending: false })
    .limit(1);

  if (error) return res.status(400).json({ error: error.message });

  const ultimo = data.length > 0 ? data[0].correlativo : 0;
  res.json({ ultimo, siguiente: ultimo + 1 });
});

// GET: obtener un envío por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('maestro_envios')
    .select('*,coordinaciones_departamentales(departamento,coordinador,direccion_fisica,contacto)')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ⚡ NUEVO: obtener un envío por correlativo
router.get('/correlativo/:correlativo', async (req, res) => {
  const { correlativo } = req.params;
  const { data, error } = await supabase
    .from('maestro_envios')
    .select('*,coordinaciones_departamentales(departamento,coordinador,direccion_fisica,contacto)')
    .eq('correlativo', correlativo)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST: crear un nuevo envío
router.post('/', async (req, res) => {
  const { id_coordinacion, correlativo, tipo_entrega, no_guia, empresa_courier, fecha, hora, id_courier } = req.body;
  const { data, error } = await supabase
    .from('maestro_envios')
    .insert([{ id_coordinacion, correlativo, tipo_entrega, no_guia, empresa_courier, fecha, hora, id_courier  }]) 
    .select(`*,coordinaciones_departamentales(departamento,coordinador,direccion_fisica,contacto)`);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT: actualizar un envío por id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_coordinacion, correlativo, tipo_entrega, no_guia, empresa_courier, fecha, hora, id_courier } = req.body;
  const { data, error } = await supabase
    .from('maestro_envios')
    .update({ id_coordinacion, correlativo, tipo_entrega, no_guia, empresa_courier, fecha, hora, id_courier })
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE: eliminar un envío por id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('maestro_envios')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Envío eliminado', data });
});

export default router;