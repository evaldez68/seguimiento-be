// routes/expedientes_estatus.js
import express from "express";
import supabase from "../db.js";

const router = express.Router();

router.put("/actualizar-estatus", async (req, res) => {
  try {
    const { ids, nuevoEstatus } = req.body;

    // Validación de entrada
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: "Debe enviar al menos un id",
        cantidad: 0,
        data: []
      });
    }

    // Actualización en Supabase
    const { data, error } = await supabase
      .from("expedientes")
      .update({
        estatus: nuevoEstatus || "Trabajado",
        updated_at: new Date().toISOString()
      })
      .in("id", ids)
      .select("*"); // 👈 devuelve las filas actualizadas

    if (error) {
      return res.status(500).json({
        success: false,
        mensaje: "Error al actualizar en la base de datos",
        cantidad: 0,
        data: [],
        error: error.message
      });
    }

    // Conteo seguro
    const cantidad = Array.isArray(data) ? data.length : 0;

    return res.status(200).json({
      success: true,
      mensaje: `Se actualizaron ${cantidad} registros correctamente`,
      cantidad,
      data: data || []
    });
  } catch (err) {
    console.error("❌ Error inesperado:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno al actualizar",
      cantidad: 0,
      data: [],
      error: err.message
    });
  }
});

export default router;