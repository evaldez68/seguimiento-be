// routes/bitacora_cambios.js

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: Bitácora por tabla e id_registro
router.get('/:tabla/:id_registro', async (req, res) => {
  try {
    const { tabla, id_registro } = req.params;

    const { data, error } = await supabase
      .from('bitacora_cambios')
      .select('*')
      .eq('tabla_modificada', tabla)
      .eq('id_registro', id_registro)
      .order('fecha', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error obteniendo bitácora:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Registrar cambio
router.post('/', async (req, res) => {
  try {
    const {
      tabla_modificada,
      id_registro,
      campo_modificado,
      valor_anterior,
      valor_nuevo,
      accion_realizada,
      usuario
    } = req.body;

    const { data, error } = await supabase
      .from('bitacora_cambios')
      .insert([{
        tabla_modificada,
        id_registro,
        campo_modificado,
        valor_anterior,
        valor_nuevo,
        accion_realizada,
        usuario
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error registrando bitácora:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;