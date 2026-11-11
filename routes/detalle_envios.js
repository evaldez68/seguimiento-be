// routes/detalle_envios.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar todos los detalles de envíos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ⚡ NUEVO: obtener documentos por correlativo del maestro
router.get('/correlativo/:correlativo', async (req, res) => {
  const { correlativo } = req.params;

  // Buscar maestro por correlativo
  const { data: maestro, error: maestroError } = await supabase
    .from('maestro_envios')
    .select('id')
    .eq('correlativo', correlativo)
    .single();

  if (maestroError || !maestro) {
    return res.status(404).json({ error: "Maestro no encontrado" });
  }

  // Buscar documentos vinculados al id_maestro_envio
  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('id_maestro_envio', maestro.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET: obtener un detalle por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST: crear un nuevo detalle de envío
router.post('/', async (req, res) => {
  const { id_maestro_envio, tipo_documento, numero_documento, programa, subprograma } = req.body;
  const { data, error } = await supabase
    .from('detalle_envios')
    .insert([{id_maestro_envio,tipo_documento,numero_documento,programa,subprograma,estado: 'P',oficio_original: numero_documento}]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT: actualizar un detalle por id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_maestro_envio, tipo_documento, numero_documento, programa, subprograma, estado, oficio_original, descripcion } = req.body;
  const { data, error } = await supabase
    .from('detalle_envios')
    .update({ id_maestro_envio, tipo_documento, numero_documento, programa, subprograma, estado, oficio_original, descripcion })
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE: eliminar un detalle por id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('detalle_envios')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Detalle eliminado', data });
});

export default router;