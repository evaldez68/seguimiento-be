// routes/usuarios_seguimiento.js
import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar todos los usuarios con su rol
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios_seguimiento')
    .select('id, nombre, correo, activo, fecha_registro, roles_seguimiento(nombre, descripcion)')
    .order('fecha_registro', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET: obtener un usuario por id con su rol
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('usuarios_seguimiento')
    .select('id, nombre, correo, activo, fecha_registro, roles_seguimiento(nombre, descripcion)')
    .eq('id', id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST: crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, correo, contrasena, rol_id } = req.body;
  const { data, error } = await supabase
    .from('usuarios_seguimiento')
    .insert([{ nombre, correo, contrasena, rol_id }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// POST: login de usuario
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  const { data, error } = await supabase
    .from('usuarios_seguimiento')
    .select('id, nombre, correo, activo, roles_seguimiento(nombre, descripcion)')
    .eq('correo', correo)
    .eq('contrasena', contrasena)
    .single();
  
    if (error || !data) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  if (!data.activo) return res.status(403).json({ error: 'Usuario inactivo' });

  res.json(data);
});

export default router;