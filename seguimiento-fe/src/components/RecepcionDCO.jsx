// src/components/RecepcionDCO.jsx

import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Select, MenuItem, Snackbar, Alert, Radio, RadioGroup, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

function RecepcionDCO() {

  const [programas, setProgramas] = useState([]);
  const [programa, setPrograma] = useState("");
  const [documentos, setDocumentos] = useState([]);

  const [openNota, setOpenNota] = useState(false);
  const [notaTraslado, setNotaTraslado] = useState("");

  const [snackbar, setSnackbar] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [severity, setSeverity] = useState("success");
  const [iniciales, setIniciales] = useState("");

  useEffect(() => {
    fetch("https://seguimiento-be-production-7e17.up.railway.app/programas")
      .then((res) => res.json())
      .then((data) => setProgramas(data))
      .catch(() => mostrarMensaje("Error al cargar programas", "error"));
  }, []);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setSeverity(tipo);
    setSnackbar(true);
  };
  const buscarPendientes = async () => {

    if (!programa) {
      mostrarMensaje("Seleccione un programa", "warning");
      return;
    }

    try {

      const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/recepcion_envios/pendientes/${programa}`);
      const data = await res.json();

      const registros = (data || []).map(doc => ({
        ...doc,
        accion: "",
        descripcion_local: doc.descripcion || ""
      }));

      setDocumentos(registros);

    } catch {

      mostrarMensaje("Error al consultar documentos", "error");

    }

  };

  const cambiarAccion = (id, accion) => {

    setDocumentos(documentos.map(doc =>
      doc.id === id
        ? { ...doc, accion }
        : doc
    ));

  };

  const cambiarDescripcion = (id, descripcion) => {

    setDocumentos(documentos.map(doc =>
      doc.id === id
        ? { ...doc, descripcion_local: descripcion }
        : doc
    ));

  };

  const grabarDocumentos = () => {

    const documentosMarcados = documentos.filter(doc => doc.accion === "R" || doc.accion === "N");

    if (documentosMarcados.length === 0) {
      mostrarMensaje("No hay documentos marcados", "warning");
      return;
    }

    setOpenNota(true);

  };

  const confirmarGrabacion = async () => {

    if (!notaTraslado) {
      mostrarMensaje("Ingrese número de nota", "warning");
      return;
    }

    try {

      const documentosMarcados = documentos.filter(doc => doc.accion === "R" || doc.accion === "N");

      for (const doc of documentosMarcados) {

        const url =
          doc.accion === "R"
            ? `https://seguimiento-be-production-7e17.up.railway.app/recepcion_envios/recepcion/${doc.id}`
            : `https://seguimiento-be-production-7e17.up.railway.app/recepcion_envios/rechazo/${doc.id}`;

        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descripcion: doc.descripcion_local,
            nota_traslado: notaTraslado
          })
        });

      }

      setOpenNota(false);
      //setNotaTraslado("");

      mostrarMensaje("Documentos actualizados correctamente", "success");

      buscarPendientes();

    } catch {

      mostrarMensaje("Error al grabar documentos", "error");

    }

  };

  const imprimirNota = () => {
    console.log("Nota:", notaTraslado);
    console.log("Iniciales:", iniciales);

    if (!notaTraslado) {
      mostrarMensaje("Primero debe grabar una recepción", "warning");
      return;
    }

    if (!iniciales) {
      mostrarMensaje("Ingrese las iniciales", "warning");
      return;
    }

    window.open(`https://seguimiento-be-production-7e17.up.railway.app/nota_traslado_docto/${notaTraslado}/${iniciales}`,"_blank");

  };

  const obtenerColorEstado = (estado) => {

    if (estado === "P") return "warning";
    if (estado === "R") return "success";
    if (estado === "N") return "error";

    return "default";

  };

  const obtenerTextoEstado = (estado) => {

    if (estado === "P") return "Pendiente";
    if (estado === "R") return "Recibido";
    if (estado === "N") return "Rechazado";

    return estado;

  };
    return (
    <Box sx={{ p: 2 }}>

      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          RECEPCIÓN DE DOCUMENTOS DCO
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>

          <Grid item xs={12} md={8}>
            <Select
              fullWidth
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Seleccione un Programa</MenuItem>

              {programas.map((p) => (
                <MenuItem key={p.id} value={p.nombre_programa}>
                  {p.nombre_programa}
                </MenuItem>
              ))}

            </Select>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={buscarPendientes}
            >
              Buscar
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Chip
              color="warning"
              label={`Pendientes: ${documentos.length}`}
            />
          </Grid>

        </Grid>

      </Paper>

      <Paper elevation={3}>

        <TableContainer>

          <Table size="small">

            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Documento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              {documentos.map((doc) => (

                <TableRow key={doc.id} hover>

                  <TableCell>{doc.numero_documento}</TableCell>

                  <TableCell>{doc.tipo_documento}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color={obtenerColorEstado(doc.estado)}
                      label={obtenerTextoEstado(doc.estado)}
                    />
                  </TableCell>

                  <TableCell>

                    <RadioGroup
                      row
                      value={doc.accion}
                      onChange={(e) => cambiarAccion(doc.id, e.target.value)}
                    >
                      <FormControlLabel value="R" control={<Radio />} label="Recibido" />
                      <FormControlLabel value="N" control={<Radio />} label="Rechazado" />
                    </RadioGroup>

                  </TableCell>

                  <TableCell>

                    <TextField
                      fullWidth
                      size="small"
                      value={doc.descripcion_local}
                      onChange={(e) => cambiarDescripcion(doc.id, e.target.value)}
                      disabled={doc.accion === ""}
                      inputProps={{ maxLength: 150 }}
                    />

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </TableContainer>

      </Paper>

      <Box sx={{ mt: 2 }}>

        <Button variant="contained" color="success" sx={{ mr: 2 }} onClick={grabarDocumentos}>
          Grabar
        </Button>

        <Button variant="contained" color="primary" onClick={imprimirNota}>
          Imprimir Nota
        </Button>

      </Box>

      <Dialog
        open={openNota}
        onClose={() => setOpenNota(false)}
      >

        <DialogTitle>
          Número de Nota de Traslado
        </DialogTitle>

        <DialogContent>

          <TextField autoFocus fullWidth margin="dense" label="Nota de Traslado" type="number" value={notaTraslado} onChange={(e) => setNotaTraslado(e.target.value)}/>
          <TextField           fullWidth margin="dense" label="Iniciales" value={iniciales} onChange={(e) => setIniciales(e.target.value.toUpperCase())}/>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setOpenNota(false)}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={confirmarGrabacion}
          >
            Aceptar
          </Button>

        </DialogActions>

      </Dialog>

      <Snackbar
        open={snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(false)}
      >

        <Alert
          severity={severity}
          onClose={() => setSnackbar(false)}
          sx={{ width: '100%' }}
        >
          {mensaje}
        </Alert>

      </Snackbar>

    </Box>
  );
}

export default RecepcionDCO;