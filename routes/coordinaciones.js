// .routes/coordinaciones.js
import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar todas las coordinaciones
router.get('/', async (req, res) => {
const { data, error } = await supabase
  .from('coordinaciones_departamentales')
  .select('*')
    .order('departamento', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST: agregar una nueva coordinación
router.post('/', async (req, res) => {
  const { departamento, coordinador, direccion_fisica, contacto } = req.body;

  const { data, error } = await supabase
    .from('coordinaciones_departamentales')
    .insert([{ departamento, coordinador, direccion_fisica, contacto }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// PUT: actualizar una coordinación por id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { departamento, coordinador, direccion_fisica, contacto } = req.body;

  const { data, error } = await supabase
    .from('coordinaciones_departamentales')
    .update({ departamento, coordinador, direccion_fisica, contacto })
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE: eliminar una coordinación por id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('coordinaciones_departamentales')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Coordinación eliminada', data });
});

export default router;