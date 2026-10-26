// src/components/CargaExpedientes.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {Typography, Snackbar, Alert, TextField, LinearProgress, Paper} from "@mui/material";

const parseFecha = (valor) => {
  if (!valor) return null;
  const partes = valor.toString().split("/");
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2,"0")}-${dia.padStart(2,"0")}`;
  }
  return valor;
};

const limitar = (valor, max) =>
  valor ? valor.toString().slice(0, max) : null;

const CargaExpedientes = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Error: Seleccione un archivo Excel");
      return;
    }

    setLoading(true);
    setMessage("");
    setProgress(0);

    try {
      // 1️⃣ Obtener nuevo id_carga antes de procesar
      const respId = await fetch("http://seguimiento-be-production-7e17.up.railway.app/expedientes_batch/next-id");
      const { nuevoId } = await respId.json();

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = rows[0].map((h) => h.toLowerCase().trim());

      const registros = rows.slice(1).map((r) => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i]; });
        return {
          rub: limitar(obj.rub, 50),
          estatus: "Nuevo",
          departamento: limitar(obj.departamento, 50),
          municipio: limitar(obj.municipio, 50),
          lugar_poblado: limitar(obj["lugar poblado"], 50),
          direccion: obj.direccion ? obj.direccion.toString().slice(0, 1000) : null,
          codigo_familia: limitar(obj["codigo familia"], 20),
          codigo_titular: limitar(obj["codigo titular"], 20),
          primer_nombre: limitar(obj["primer nombre"], 20),
          segundo_nombre: limitar(obj["segundo nombre"], 20),
          tercer_nombre: limitar(obj["tercer nombre"], 20),
          primer_apellido: limitar(obj["primer apellido"], 20),
          segundo_apellido: limitar(obj["segundo apellido"], 20),
          apellido_casada: limitar(obj["apellido casada"], 20),
          telefonos: limitar(obj.telefonos, 30),
          fecha_nacimiento: parseFecha(obj["fecha de nacimiento"]),
          genero: limitar(obj.genero, 15),
          es_extranjero: obj["es extranjero"] === "true",
          estado_conyugal: limitar(obj["estado conyugal"], 20),
          embarazada: obj.embarazada === "true",
          beneficio_familia: limitar(obj["beneficio familia"], 50),
          estatus_hogar: limitar(obj["estatus hogar"], 50),
          identificacion: limitar(obj.identificacion, 50),
          fecha_ingreso_padron: parseFecha(obj["fecha de ingreso al padrón"]),
          posee_carta_ultimoregistro: obj["posee carta ultimoregistro"] === "true",
          posee_expediente_ultimoregistro: obj["posee expediente ultimoregistro"] === "true",
          geolocalizacion: limitar(obj.geolocalizacion, 200),
          observacion: [obj.observacion1, obj.observacion2, obj.observacion3]
            .filter(Boolean)
            .join(" | ")
            .slice(0, 1000),
          id_carga: nuevoId // 👈 mismo id_carga para todos
        };
      });

      console.log("JSON de carga:", registros);

      // 2️⃣ Dividir en lotes y enviar al endpoint batch
      const chunkSize = 2000;
      const totalChunks = Math.ceil(registros.length / chunkSize);
      let totalInsertados = 0;

      for (let i = 0; i < registros.length; i += chunkSize) {
        const lote = registros.slice(i, i + chunkSize);

        setMessage(`Procesando lote ${i/chunkSize+1} de ${totalChunks}...`);
        setProgress(Math.round(((i/chunkSize+1) / totalChunks) * 100));

        const response = await fetch("http://seguimiento-be-production-7e17.up.railway.app/expedientes_batch/cargar-masivo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lote),
        });

        const result = await response.json();
        if (response.ok) {
          totalInsertados += result.cantidad || lote.length;
        } else {
          throw new Error(result.error || "Error en carga masiva");
        }
      }

      setMessage(`✅ Se cargaron ${totalInsertados} registros correctamente`);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setMessage("Error procesando archivo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper className="contenedor-principal" sx={{ p: 3, maxWidth: 2700, margin: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ color: "var(--guatemala-dark)", mb: 2 }}>
        📑 Carga de Expedientes
      </Typography>

      <TextField
        size="small"
        value={file ? file.name : ""}
        placeholder="Nombre del archivo"
        InputProps={{ readOnly: true }}
        sx={{
          mb: 2,
          width: "100%",
          backgroundColor: "var(--guatemala-gray)",
          borderRadius: "6px"
        }}
      />
      <div>
        <button className="btn-accion" onClick={() => document.querySelector("#fileInput").click()}>
          Seleccionar Archivo
        </button>
        <input
          id="fileInput"
          type="file"
          hidden
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />

        <button className="btn-accion" onClick={handleUpload} disabled={loading}>
          {loading ? "Procesando..." : "Cargar Archivo"}
        </button>
      </div>

      {loading && (
        <LinearProgress sx={{ mt: 2, color: "var(--guatemala-blue)" }} variant="determinate" value={progress} />
      )}

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage("")}>
        <Alert severity={message.includes("Error") ? "error" : "success"} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CargaExpedientes;