// routes/expedientes.js

import express from "express";
import supabase from "../db.js";

const router = express.Router();

// CRUD básico
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("expedientes")
    .select("*")
    .order("id", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post("/", async (req, res) => {
  const { error } = await supabase.from("expedientes").insert([req.body]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Expediente creado correctamente" });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("expedientes").update(req.body).eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: `Expediente ${id} actualizado correctamente` });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("expedientes").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: `Expediente ${id} eliminado correctamente` });
});

// GET: estatus más reciente por RUB
router.get("/rub/:rub", async (req, res) => {
  const { rub } = req.params;
  const { data, error } = await supabase
    .from("expedientes")
    .select("estatus")
    .eq("rub", rub)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") return res.status(400).json({ error: error.message });
  if (!data) return res.json(null);
  res.json({ estatus: data.estatus });
});

// POST: batch de RUBs
router.post("/rub/batch", async (req, res) => {
  try {
    const { rubs } = req.body;
    if (!Array.isArray(rubs)) return res.status(400).json({ error: "Debe enviar un array de RUBs" });
    if (rubs.length === 0) return res.json([]);
    const { data, error } = await supabase
      .from("expedientes")
      .select("rub, estatus")
      .in("rub", rubs.filter(r => r));
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: carga masiva
router.post("/cargar", async (req, res) => {
  try {
    const registros = req.body;
    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ error: "Debe enviar un array de expedientes" });
    }

    const { data: maxData, error: maxError } = await supabase
      .from("expedientes")
      .select("id_carga")
      .order("id_carga", { ascending: false })
      .limit(1);
    if (maxError) throw maxError;

    const maxId = maxData?.[0]?.id_carga || 0;
    const nuevoId = maxId + 1;

    const registrosConCarga = registros.map(r => ({
      ...r,
      id_carga: nuevoId,
      estatus: "Nuevo"
    }));

    const { error: insertError } = await supabase.from("expedientes").insert(registrosConCarga);
    if (insertError) throw insertError;

    res.json({ mensaje: `Se cargaron ${registrosConCarga.length} registros con id_carga ${nuevoId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVO GET: expedientes filtrados por id_carga y departamento
// GET: expedientes filtrados por id_carga y departamento con bloques automáticos
router.get("/coordinacion/:id_carga/:departamento", async (req, res) => {
  try {
    const { id_carga, departamento } = req.params;
    if (!id_carga || !departamento) {
      return res.status(400).json({ error: "Debe especificar id_carga y departamento" });
    }

    // contar registros primero
    const { count, error: countError } = await supabase
      .from("expedientes")
      .select("*", { count: "exact", head: true })
      .eq("id_carga", id_carga)
      .ilike("departamento", departamento);

    if (countError) throw countError;

    let allData = [];
    const pageSize = 1000;

    if (count <= pageSize) {
      // menos de 1000 → traer todo de una vez
      const { data, error } = await supabase
        .from("expedientes")
        .select("*")
        .eq("id_carga", id_carga)
        .ilike("departamento", departamento);
      if (error) throw error;
      allData = data || [];
    } else {
      // más de 1000 → traer en bloques automáticos
      for (let start = 0; start < count; start += pageSize) {
        const { data, error } = await supabase
          .from("expedientes")
          .select("*")
          .eq("id_carga", id_carga)
          .ilike("departamento", departamento)
          .range(start, start + pageSize - 1);
        if (error) throw error;
        allData = allData.concat(data || []);
      }
    }

    const conNombre = allData.map(r => ({
      ...r,
      nombre: [
        r.primer_nombre,
        r.segundo_nombre,
        r.tercer_nombre,
        r.primer_apellido,
        r.segundo_apellido,
        r.apellido_casada
      ].filter(Boolean).join(" ")
    }));

    res.json(conNombre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: expedientes filtrados por id_carga, departamento y municipio con bloques automáticos
router.get("/coordinacion/:id_carga/:departamento/:municipio", async (req, res) => {
  try {
    const { id_carga, departamento, municipio } = req.params;
    if (!id_carga || !departamento || !municipio) {
      return res.status(400).json({ error: "Debe especificar id_carga, departamento y municipio" });
    }

    // contar registros primero
    const { count, error: countError } = await supabase
      .from("expedientes")
      .select("*", { count: "exact", head: true })
      .eq("id_carga", id_carga)
      .ilike("departamento", departamento)
      .ilike("municipio", municipio);

    if (countError) throw countError;

    let allData = [];
    const pageSize = 1000;

    if (count <= pageSize) {
      // menos de 1000 → traer todo de una vez
      const { data, error } = await supabase
        .from("expedientes")
        .select("*")
        .eq("id_carga", id_carga)
        .ilike("departamento", departamento)
        .ilike("municipio", municipio);
      if (error) throw error;
      allData = data || [];
    } else {
      // más de 1000 → traer en bloques automáticos
      for (let start = 0; start < count; start += pageSize) {
        const { data, error } = await supabase
          .from("expedientes")
          .select("*")
          .eq("id_carga", id_carga)
          .ilike("departamento", departamento)
          .ilike("municipio", municipio)
          .range(start, start + pageSize - 1);
        if (error) throw error;
        allData = allData.concat(data || []);
      }
    }

    const conNombre = allData.map(r => ({
      ...r,
      nombre: [
        r.primer_nombre,
        r.segundo_nombre,
        r.tercer_nombre,
        r.primer_apellido,
        r.segundo_apellido,
        r.apellido_casada
      ].filter(Boolean).join(" ")
    }));

    res.json(conNombre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: cargas únicas
router.get("/cargas", async (req, res) => {
  try {
    const { data, error } = await supabase.from("expedientes").select("id_carga").order("id_carga");
    if (error) throw error;
    const unicos = [...new Set(data.map(d => d.id_carga))];
    res.json(unicos.map(id => ({ id_carga: id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: departamentos
router.get("/departamentos", async (req, res) => {
  try {
    const { data, error } = await supabase.from("departamentos").select("id_departamento, nombre").order("nombre");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expedientes agrupados por departamento
router.get("/deptos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("expedientes_por_departamento")
      .select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expedientes agrupados por departamento y carga
router.get("/deptos/:id_carga", async (req, res) => {
  const { id_carga } = req.params;
  try {
    const { data, error } = await supabase
      .from("expedientes_por_departamento_carga")
      .select("*")
      .eq("id_carga", id_carga);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expedientes agrupados por estatus
router.get("/estatus", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("expedientes_por_estatus")
      .select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expedientes agrupados por estatus, carga
router.get("/estatus/:id_carga", async (req, res) => {
  const { id_carga } = req.params;
  try {
    const { data, error } = await supabase
      .from("expedientes_por_estatus_carga")
      .select("*")
      .eq("id_carga", id_carga);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expedientes agrupados por estatus de un departamento específico
router.get("/estatus_depto/:departamento", async (req, res) => {
  const { departamento } = req.params;
  try {
    const { data, error } = await supabase
      .from("expedientes_por_estatus_depto")
      .select("*")
      .eq("departamento", departamento); // filtramos sobre la vista

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expedientes agrupados por estatus de un departamento específico
router.get("/estatus_depto/:id_carga/:departamento", async (req, res) => {
  const { id_carga, departamento } = req.params;
  try {
    const { data, error } = await supabase
      .from("expedientes_por_estatus_depto_carga")
      .select("*")
      .eq("departamento", departamento) // filtramos sobre la vista
      .eq("id_carga", id_carga);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1) Endpoint con id_carga, departamento y municipio
router.get('/rutas/:id_carga/:departamento/:municipio', async (req, res) => {
  const { id_carga, departamento, municipio } = req.params;
  let allData = [];
  let start = 0;
  const blockSize = 5000;

  try {
    while (true) {
      const { data, error } = await supabase
        .from('expedientes_rutas')
        .select('*')
        .eq('id_carga', id_carga)
        .ilike('departamento', departamento)
        .ilike('municipio', municipio)
        .range(start, start + blockSize - 1);

      if (error) return res.status(400).json({ error: error.message });
      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      if (data.length < blockSize) break;
      start += blockSize;
    }

    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) Endpoint con id_carga y departamento
router.get('/rutas/:id_carga/:departamento', async (req, res) => {
  const { id_carga, departamento } = req.params;
  let allData = [];
  let start = 0;
  const blockSize = 5000;

  try {
    while (true) {
      const { data, error } = await supabase
        .from('expedientes_rutas')
        .select('*')
        .eq('id_carga', id_carga)
        .ilike('departamento', departamento)
        .range(start, start + blockSize - 1);

      if (error) return res.status(400).json({ error: error.message });
      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      if (data.length < blockSize) break;
      start += blockSize;
    }

    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/filtrar/:departamento", async (req, res) => {
  const { id_carga, departamento } = req.params;
  let allData = [];
  let start = 0;
  const blockSize = 5000;

  try {
    while (true) {
      const { data, error } = await supabase
        .from("expedientes")
        .select("*")
        .ilike("departamento", departamento)
        .range(start, start + blockSize - 1);

      if (error) return res.status(400).json({ error: error.message });
      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      if (data.length < blockSize) break;
      start += blockSize;
    }

    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/filtrar/:departamento/:municipio", async (req, res) => {
  const { id_carga, departamento, municipio } = req.params;
  let allData = [];
  let start = 0;
  const blockSize = 5000;

  try {
    while (true) {
      const { data, error } = await supabase
        .from("expedientes")
        .select("*")
        .ilike("departamento", departamento)
        .ilike("municipio", municipio)
        .range(start, start + blockSize - 1);

      if (error) return res.status(400).json({ error: error.message });
      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      if (data.length < blockSize) break;
      start += blockSize;
    }

    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para consultar resumen de expedientes
router.get("/resumen", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("expedientes_resumen")
      .select("*")
      .order("fecha_carga", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener resumen de expedientes" });
  }
});

router.get('/consulta', async (req, res) => {
  const { campo, valor } = req.query;

  const { data, error } = await supabase
    .from('consulta_expedientes')   // 👈 usamos la vista
    .select('*')
    .ilike(campo, `%${valor}%`);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;