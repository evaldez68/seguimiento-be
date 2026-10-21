// routes/subprogramas.js
import express from "express";
import supabase from "../db.js";

const router = express.Router();

// GET todos los subprogramas
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("subprogramas")
    .select("id, nombre, encargado, piso_entrega, id_programa, programas(nombre_programa)")
    .order("id", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST nuevo subprograma
router.post("/", async (req, res) => {
  const { id_programa, nombre, encargado, piso_entrega } = req.body;
  const { data, error } = await supabase
    .from("subprogramas")
    .insert([{ id_programa, nombre, encargado, piso_entrega }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// PUT actualizar subprograma
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { id_programa, nombre, encargado, piso_entrega } = req.body;
  const { data, error } = await supabase
    .from("subprogramas")
    .update({ id_programa, nombre, encargado, piso_entrega })
    .eq("id", id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// DELETE eliminar subprograma
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("subprogramas").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.sendStatus(204);
});

export default router;