// src/components/SeguimientoEnvios.jsx
import React, { useState, useEffect } from "react";
import {
  Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, Button, TextField,
  Select, MenuItem, Snackbar, Alert
} from "@mui/material";


function SeguimientoEnvios() {
  const [correlativo, setCorrelativo] = useState("");
  const [maestro, setMaestro] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [recibidos, setRecibidos] = useState([]);
  const [rechazados, setRechazados] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [idProcesoSeleccionado, setIdProcesoSeleccionado] = useState("");
  const usuarioLogin = JSON.parse(localStorage.getItem("usuario"));

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const mostrarMensaje = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  // Formatear fecha dd/mm/yyyy
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate() + 1).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // Cargar procesos
  useEffect(() => {
    const cargarProcesos = async () => {
      try {
        const res = await fetch("http://localhost:3000/procesos");
        const data = await res.json();
        setProcesos(data);
      } catch (err) {
        console.error("Error al cargar procesos:", err);
      }
    };
    cargarProcesos();
  }, []);

  // Buscar correlativo
  const buscarEnvio = async () => {
    if (!correlativo) {
      mostrarMensaje("Debe ingresar un correlativo ❌", "warning");
      return;
    }

    try {
      const resMaestro = await fetch(`http://localhost:3000/maestro_envios/correlativo/${correlativo}`);
      if (!resMaestro.ok) {
        mostrarMensaje("El correlativo no existe ❌", "error");
        setMaestro(null);
        setDocumentos([]);
        setRecibidos([]);
        setRechazados([]);
        return;
      }
      const maestroData = await resMaestro.json();

      const resDocs = await fetch(`http://localhost:3000/detalle_envios/correlativo/${correlativo}`);
      const docsData = await resDocs.json();

      setMaestro(maestroData);
      setDocumentos(docsData);
      setRecibidos([]);
      setRechazados([]);
    } catch (err) {
      console.error("Error al buscar envío:", err);
      mostrarMensaje("Error al buscar envío ❌", "error");
    }
  };

  // Toggle Recibido
  const toggleRecibido = (id) => {
    setRecibidos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setRechazados((prev) => prev.filter((x) => x !== id));
  };

  // Toggle Rechazado
  const toggleRechazado = (id) => {
    setRechazados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setRecibidos((prev) => prev.filter((x) => x !== id));
  };

  // Grabar seguimiento
const grabarSeguimiento = async () => {
  if (!correlativo) {
    mostrarMensaje("Debe ingresar un correlativo ❌", "warning");
    return;
  }
  if (!idProcesoSeleccionado) {
    mostrarMensaje("Debe seleccionar un proceso antes de grabar ❌", "warning");
    return;
  }
  if (documentos.length === 0) {
    mostrarMensaje("No hay documentos para este correlativo ❌", "warning");
    return;
  }
  if (recibidos.length === 0 && rechazados.length === 0) {
    mostrarMensaje("Debe marcar al menos Recibido o Rechazado ❌", "warning");
    return;
  }

  try {
    const payload = documentos
      .filter((doc) => recibidos.includes(doc.id) || rechazados.includes(doc.id))
      .map((doc) => ({
        id_envio: maestro.id,
        id_proceso: parseInt(idProcesoSeleccionado),
        id_documento: doc.id,
        usuario: usuarioLogin.nombre,
        recibido: recibidos.includes(doc.id),
        rechazado: rechazados.includes(doc.id),
      }));

    console.log("Payload a enviar:", payload);

    const resp = await fetch("http://localhost:3000/seguimiento_documentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Capturar errores del backend
    if (!resp.ok) {
      const err = await resp.json();
      mostrarMensaje(`Error: ${err.error}`, "error");
      return;
    }

    mostrarMensaje("Seguimiento grabado correctamente ✅", "success");

    // Resetear formulario
    setCorrelativo("");
    setMaestro(null);
    setDocumentos([]);
    setRecibidos([]);
    setRechazados([]);
    setIdProcesoSeleccionado("");
  } catch (err) {
    console.error("Error al grabar seguimiento:", err);
    mostrarMensaje("Error al grabar seguimiento ❌", "error");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>Seguimiento de Envíos</h2>

      <Grid container spacing={2} >
        <Grid item xs={5}>
          <TextField
            label="Correlativo del envío"
            variant="outlined"
            value={correlativo}
            onChange={(e) => setCorrelativo(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" onClick={buscarEnvio} fullWidth>
            Buscar
          </Button>
        </Grid>
        <Grid item xs={5}>
          <Select
            value={idProcesoSeleccionado}
            onChange={(e) => setIdProcesoSeleccionado(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">
              <em>-- Seleccione Proceso --</em>
            </MenuItem>
            {procesos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre_proceso} - {p.encargado}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {maestro && (
        <Paper sx={{ padding: 2, marginBottom: 2 }}>
          <h3>Datos del Envío</h3>
          <p><strong>Usuario:</strong> {usuarioLogin.nombre}</p>
          <p><strong>Correlativo:</strong> {maestro.correlativo}</p>
          <p><strong>Tipo de Entrega:</strong> {maestro.tipo_entrega}</p>
          <p><strong>No. de Guía:</strong> {maestro.no_guia}</p>
          <p><strong>Empresa Courier:</strong> {maestro.empresa_courier}</p>
          <p><strong>Fecha del Envío:</strong> {formatearFecha(maestro.fecha)} - {maestro.hora}</p>
        </Paper>
      )}

      {documentos.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo de Documento</TableCell>
                <TableCell>Número de Documento</TableCell>
                <TableCell>Programa</TableCell>
                <TableCell>Subprograma</TableCell>
                <TableCell align="center">Recibido</TableCell>
                <TableCell align="center">Rechazado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.tipo_documento}</TableCell>
                  <TableCell>{doc.numero_documento}</TableCell>
                  <TableCell>{doc.programa}</TableCell>
                  <TableCell>{doc.subprograma}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={recibidos.includes(doc.id)}
                      onChange={() => toggleRecibido(doc.id)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={rechazados.includes(doc.id)}
                      onChange={() => toggleRechazado(doc.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {documentos.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained" color="primary" onClick={grabarSeguimiento}>
            Grabar
          </Button>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={null}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default SeguimientoEnvios;          