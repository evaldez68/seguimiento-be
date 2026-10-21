// routes/couriers.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// 🔹 Listar todos los couriers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('couriers').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Obtener courier por id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('couriers')
      .select('*')
      .eq('id_courier', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Crear courier
router.post('/', async (req, res) => {
  try {
    const { nombre, url_tracking } = req.body;
    const { data, error } = await supabase
      .from('couriers')
      .insert([{ nombre, url_tracking }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Actualizar courier
router.put('/:id', async (req, res) => {
  try {
    const { nombre, url_tracking } = req.body;
    const { data, error } = await supabase
      .from('couriers')
      .update({ nombre, url_tracking })
      .eq('id_courier', req.params.id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Eliminar courier
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('couriers')
      .delete()
      .eq('id_courier', req.params.id);
    if (error) throw error;
    res.json({ message: 'Courier eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;