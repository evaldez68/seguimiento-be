// src/components/SeguimientoEnvios.jsx

import React, { useState, useEffect } from "react";
import {
  Grid, Table, TableBody, TableCell, TableContainer, Box, Typography,
  TableHead, TableRow, Paper, Checkbox, Button, TextField,
  Select, MenuItem, Snackbar, Alert
} from "@mui/material";


function SeguimientoEnvios() {
//  const [correlativo, setCorrelativo] = useState("");
  const [maestro, setMaestro] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [recibidos, setRecibidos] = useState([]);
  const [rechazados, setRechazados] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [idProcesoSeleccionado, setIdProcesoSeleccionado] = useState("");
  const usuarioLogin = JSON.parse(localStorage.getItem("usuario"));
  const [programas, setProgramas] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState("");
  const [documentosOriginales, setDocumentosOriginales] = useState([]);  

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
        const res = await fetch("https://seguimiento-be-production-7e17.up.railway.app/procesos");
        const data = await res.json();
        setProcesos(data);
      } catch (err) {
        console.error("Error al cargar procesos:", err);
      }
    };
    cargarProcesos();
    }, []);

  // Cargar procesos
  useEffect(() => {
  const cargarProgramas = async () => {
    try {
      const res = await fetch("https://seguimiento-be-production-7e17.up.railway.app/programas");
      const data = await res.json();
      setProgramas(data);
    } catch (err) {
      console.error("Error al cargar programas:", err);
    }
  };

  cargarProgramas();
  }, []);

  // Buscar correlativo
  const buscarEnvio = async () => {
    if (!programaSeleccionado) {mostrarMensaje("Debe seleccionar un programa ❌", "warning");
    return;
    }

    try {
      const resDocs = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/recepcion_envios/recibidos/${encodeURIComponent(programaSeleccionado)}`);
      const docsData = await resDocs.json();

      if (docsData.length === 0) {mostrarMensaje("No existen documentos recibidos para este programa ❌","warning");
        setDocumentos([]);
        setDocumentosOriginales([]);
        setRecibidos([]);
        setRechazados([]);
        return;}
      setDocumentos(docsData);
      setDocumentosOriginales(docsData);
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

    const resp = await fetch("https://seguimiento-be-production-7e17.up.railway.app/seguimiento_documentos", {
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
      <Grid container spacing={2} >
        <Grid item xs={5}>
          <Select value={programaSeleccionado} onChange={(e) => setProgramaSeleccionado(e.target.value)} displayEmpty fullWidth>
            <MenuItem value="">
               <em>-- Seleccione Programa --</em>
            </MenuItem>
              {programas.map((p) => (<MenuItem key={p.nombre_programa} value={p.nombre_programa}> {p.nombre_programa}
            </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" onClick={buscarEnvio} fullWidth>
            Buscar
          </Button>
        </Grid>
        <Grid item xs={5}>
          <Select
            value={idProcesoSeleccionado}
             onChange={async (e) => {
               const idProceso = parseInt(e.target.value);
               setIdProcesoSeleccionado(idProceso);
             // Buscar proceso seleccionado
               const procesoActual = procesos.find((p) => p.id === idProceso);
            // Si no tiene proceso anterior, mostrar todo
               if (!procesoActual || !procesoActual.seq_ant) {
                 setDocumentos(documentosOriginales);
                 return;
               }
            // Buscar el proceso anterior usando la secuencia
               const procesoAnterior = procesos.find((p) => p.secuencia === procesoActual.seq_ant);
               if (!procesoAnterior) {
                setDocumentos([]);
                return;
               }
               try {
                // Documentos del proceso anterior
                 const respAnterior = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/seguimiento_documentos/proceso/${procesoAnterior.id}`);
                const dataAnterior = await respAnterior.json();
                const idsAnterior = dataAnterior.map(x => x.id_documento);
                // Documentos ya procesados en el proceso actual
                 const respActual = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/seguimiento_documentos/proceso/${procesoAnterior.id}`);
                const dataActual = await respActual.json();
                const idsActual = dataActual.map(x => x.id_documento);
                // Están en el anterior pero no en el actual
                const idsPendientes = idsAnterior.filter(id => !idsActual.includes(id));
                const docsFiltrados = documentosOriginales.filter(doc => idsPendientes.includes(doc.id));
                setDocumentos(docsFiltrados);
                } catch (err) {
                  console.error(err);
                  mostrarMensaje("Error al filtrar documentos ❌", "error");
                }
             }}
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
          <Paper className="guatemala-card" sx={{ p: 3, mt: 2 }}>        
          <Box sx={{mb: 3,pb: 2,borderBottom: "2px solid var(--guatemala-azul)"}}>
            <Typography variant="h5" sx={{color: "var(--guatemala-azul)",fontWeight: 700}}>
               Seguimiento de Documentos
            </Typography>
          </Box>
          <Table>
            <TableHead sx={{"& th:first-of-type": {borderTopLeftRadius: "12px"},"& th:last-of-type": {borderTopRightRadius: "12px"}, 
              "& th":{borderRight:"1px solid #D3D3D3"}, "& th:last-child":{borderRight:"none"}}}>
              <TableRow sx={{"& td": {borderBottom: "8px solid #fff"}}}>
                <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Tipo de Documento</TableCell>
                <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Número de Documento</TableCell>
                <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Programa</TableCell>
                <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Sub-Programa</TableCell>
                <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Recibido</TableCell>
                <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Rechazado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{"& td":{fontSize:"16px", fontWeight: 600}}}>
              {documentos.map((doc, index) => (
              <TableRow key={doc.id} sx={{backgroundColor:index % 2 === 0 ? "#FFFFFF" : "#F8FAFC","&:hover": {backgroundColor: "#E8F1FF"}}}>
                  <TableCell>{doc.tipo_documento}</TableCell>
                  <TableCell>{doc.numero_documento}</TableCell>
                  <TableCell>{doc.programa}</TableCell>
                  <TableCell>{doc.subprograma}</TableCell>
                  <TableCell align="center"><Checkbox checked={recibidos.includes(doc.id)} onChange={() => toggleRecibido(doc.id)}/></TableCell>
                  <TableCell align="center"><Checkbox checked={rechazados.includes(doc.id)} onChange={() => toggleRechazado(doc.id)}/></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{mt: 2, mb: 3,pb: 2, borderTop: "2px solid var(--guatemala-gris2)", borderBottom: "2px solid var(--guatemala-gris2)"}}>
            <Typography variant="body2" align="left" sx={{fontSize:"18px", fontWeight: 600, color:"var(--guatemala-blue)", mt: 2}}>
               Documentos pendientes para el proceso seleccionado: {documentos.length}
            </Typography>
          </Box>
       </Paper>          
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