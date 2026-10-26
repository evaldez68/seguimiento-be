// scr/components/CargaExpedientes.jsx

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Typography,
  Snackbar,
  Alert,
  TextField,
  LinearProgress,
  Paper
} from "@mui/material";

const parseFecha = (valor) => {
  if (!valor) return null;
  const partes = valor.toString().split("/");
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2,"0")}-${dia.padStart(2,"0")}`;
  }
  return valor;
};

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
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = rows[0].map((h) => h.toLowerCase().trim());

      const registros = rows.slice(1).map((r) => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i]; });
        return {
          rub: obj.rub,
          estatus: "Nuevo",
          departamento: obj.departamento,
          municipio: obj.municipio,
          lugar_poblado: obj["lugar poblado"],
          direccion: obj.direccion,
          codigo_familia: obj["codigo familia"],
          primer_nombre: obj["primer nombre"],
          segundo_nombre: obj["segundo nombre"],
          tercer_nombre: obj["tercer nombre"],
          primer_apellido: obj["primer apellido"],
          segundo_apellido: obj["segundo apellido"],
          apellido_casada: obj["apellido casada"],
          telefonos: obj.telefonos,
          fecha_nacimiento: parseFecha(obj["fecha de nacimiento"]),
          genero: obj.genero,
          es_extranjero: obj["es extranjero"] === "true",
          estado_conyugal: obj["estado conyugal"],
          embarazada: obj.embarazada === "true",
          estado_familia: obj["estado familia"],
          identificacion: obj.identificacion,
          fecha_ingreso_padron: parseFecha(obj["fecha de ingreso al padrón"]),
          posee_carta_ultimoregistro: obj["posee carta ultimoregistro"] === "true",
          posee_expediente_ultimoregistro: obj["posee expediente ultimoregistro"] === "true",
          geolocalizacion: obj.geolocalizacion,
          observacion: [obj.observacion1, obj.observacion2, obj.observacion3]
            .filter(Boolean)
            .join(" | ")
        };
      });

      console.log("JSON de carga:", registros);

      const response = await fetch("https://seguimiento-be-production-7e17.up.railway.app/expedientes/cargar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registros),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.mensaje);
      } else {
        setMessage("Error en la carga: " + (result.error || "desconocido"));
      }

      setProgress(100);
    } catch (err) {
      setMessage("Error procesando archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper className="contenedor-principal" sx={{ p: 3, maxWidth: 700, margin: "auto", mt: 4 }}>
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