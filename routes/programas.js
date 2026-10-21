// routes/programas.js
import express from "express";
import supabase from "../db.js";

const router = express.Router();

// GET todos los programas
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("programas").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST nuevo programa
router.post("/", async (req, res) => {
  const { nombre_programa } = req.body;
  const { data, error } = await supabase
    .from("programas")
    .insert([{ nombre_programa }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// PUT actualizar programa
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre_programa } = req.body;
  const { data, error } = await supabase
    .from("programas")
    .update({ nombre_programa })
    .eq("id", id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// DELETE eliminar programa
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("programas").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.sendStatus(204);
});

export default router;