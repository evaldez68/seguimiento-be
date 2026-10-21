// routes/expedientes_batch.js
import express from "express";
import supabase from "../db.js";

const router = express.Router();

// Endpoint para obtener el próximo id_carga
router.get("/next-id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("expedientes")
      .select("id_carga")
      .order("id_carga", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const maxId = data?.[0]?.id_carga || 0;
    res.json({ nuevoId: maxId + 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para insertar lotes (ya con id_carga fijo)
router.post("/cargar-masivo", async (req, res) => {
  try {
    const registros = req.body;

    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: "Debe enviar un array de expedientes",
        cantidad: 0,
        data: []
      });
    }

    const chunkSize = 2000;
    let totalInsertados = 0;

    for (let i = 0; i < registros.length; i += chunkSize) {
      const lote = registros.slice(i, i + chunkSize);

      const { data, error } = await supabase
        .from("expedientes")
        .insert(lote)
        .select("*");

      if (error) {
        return res.status(500).json({
          success: false,
          mensaje: "Error al insertar lote",
          cantidad: 0,
          data: [],
          error: error.message
        });
      }

      totalInsertados += Array.isArray(data) ? data.length : 0;
      console.log(`✅ Lote ${i/chunkSize+1} insertado (${lote.length} registros)`);
    }

    return res.status(200).json({
      success: true,
      mensaje: `Se cargaron ${totalInsertados} registros en lotes`,
      cantidad: totalInsertados,
      data: []
    });
  } catch (err) {
    console.error("❌ Error inesperado:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno en carga masiva",
      cantidad: 0,
      data: [],
      error: err.message
    });
  }
});

export default router;