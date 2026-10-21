// routes/seguimiento_documentos.js
import express from 'express';
import supabase from '../db.js';

const router = express.Router();

// GET: listar seguimiento con joins completos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('seguimiento_documentos_vw')
    .select('*');

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// POST: insertar uno o varios seguimientos con validación de secuencia
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const registros = Array.isArray(body) ? body : [body];

    for (const reg of registros) {
      // Obtener proceso destino
      const { data: procDestino, error: errProc } = await supabase
        .from('procesos')
        .select('seq_ant')
        .eq('id', reg.id_proceso)
        .single();

      if (errProc || !procDestino) {
        return res.status(400).json({ error: 'Proceso destino inválido' });
      }

      // Obtener último seguimiento del documento
      const { data: ultimo } = await supabase
        .from('seguimiento_documentos')
        .select('id_proceso, rechazado')
        .eq('id_documento', reg.id_documento)
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (ultimo) {
        if (ultimo.rechazado) {
          return res.status(400).json({ error: 'Documento rechazado, no puede avanzar' });
        }

        // Traer la secuencia del último proceso
        const { data: procUlt } = await supabase
          .from('procesos')
          .select('secuencia')
          .eq('id', ultimo.id_proceso)
          .single();

        if (!procUlt) {
          return res.status(400).json({ error: 'Proceso actual inválido' });
        }

        // Validar secuencia: seq_ant del destino debe coincidir con secuencia del último
        if (procDestino.seq_ant !== procUlt.secuencia) {
          return res.status(400).json({ error: 'No puede saltar pasos en el flujo' });
        }
      }
    }

    // Insertar registros
    const { data, error } = await supabase
      .from('seguimiento_documentos')
      .insert(registros);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error interno al grabar seguimiento' });
  }
});

// PUT: actualizar seguimiento existente (solo campos secundarios)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { recibido, rechazado } = req.body;

  const updateFields = {};
  if (recibido !== undefined) updateFields.recibido = recibido;
  if (rechazado !== undefined) updateFields.rechazado = rechazado;

  const { data, error } = await supabase
    .from('seguimiento_documentos')
    .update(updateFields)
    .eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// DELETE: eliminar registro de seguimiento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('seguimiento_documentos')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;