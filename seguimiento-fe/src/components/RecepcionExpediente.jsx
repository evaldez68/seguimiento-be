// src/components/RecepcionExpediente.jsx

import React, { useState, useEffect } from "react";
import {  Typography,  Button,  Paper,  Alert,  Checkbox,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,
  MenuItem,  Select,  InputLabel,  FormControl,  Dialog,  DialogTitle,  DialogContent,  DialogActions,  TextField} from "@mui/material";
import { generarNotaExpediente } from "./NotaExpedientePDF";

function TrasladoExpediente({ usuario }) {
  const [nota, setNota] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [notas, setNotas] = useState([]);
  const [rows, setRows] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [correlativo, setCorrelativo] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/notas_trasla")
      .then((res) => res.json())
      .then((data) => setNotas(data || []));
  }, []);

  const handleNotaChange = async (idNota) => {
    setNota(idNota);
  };

  const handleBuscar = async () => {
    if (!nota) {
      setMensaje("Debe seleccionar una nota de traslado");
      return;
    }

    try {
      let url = `http://localhost:3000/notas_trasla/expedientes/${nota}`;
      const res = await fetch(url);
      const data = await res.json();

      setRows(data || []);
      setMensaje(`Se encontraron ${data?.length || 0} registros`);
    } catch (err) {
      setMensaje("Error al buscar expedientes traslado");
    }
  };

  const toggleSeleccion = (rub) => {
    setSeleccionados((prev) =>
      prev.includes(rub) ? prev.filter((x) => x !== rub) : [...prev, rub]
    );
  };

  const handleRecibir = async () => {
    if (seleccionados.length === 0) {
      setMensaje("Debe seleccionar al menos un expediente");
      return;
    }

    try {
      const seleccionadosData = rows.filter(r => seleccionados.includes(r.rub));

      for (const r of seleccionadosData) {
        await fetch(`http://localhost:3000/notas_trasla/expediente_update/${r.nota_traslado}/${r.rub}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estatus: "Recibido" })
        });
      }

      setMensaje(`✅ Se recibieron ${seleccionadosData.length} registros de la nota ${nota}`);
      setSeleccionados([]);
      setTimeout(() => handleBuscar(), 5000);
    } catch (err) {
    console.error("❌ Error de conexión:", err);
    setMensaje("Error al recibir expedientes");
  }
};

  return (
    <Paper sx={{ p: 3, maxWidth: 950, margin: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        📄 Recepción de Expedientes
      </Typography>

      <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
        <InputLabel>Nota de Traslado</InputLabel>
        <Select
          value={nota}
          onChange={(e) => handleNotaChange(e.target.value)}
        >
          {notas.map((n) => (
            <MenuItem key={n.nota_traslado} value={n.nota_traslado}>
              {n.nota_traslado}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleBuscar}>
        Buscar
      </Button>

      {rows.length > 0 && (
        <Button variant="contained" sx={{ ml: 2 }} onClick={handleRecibir}>
          Recibir Expedientes
        </Button>
      )}

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
        📌 Registros seleccionados: {seleccionados.length}
      </Typography>

      {mensaje && (
        <Alert severity={mensaje.includes("Error") ? "error" : "success"} sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>✔</TableCell>
              <TableCell>RUB</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Municipio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.rub}>
                <TableCell>
                  <Checkbox
                    checked={seleccionados.includes(row.rub)}
                    onChange={() => toggleSeleccion(row.rub)}
                  />
                </TableCell>
                <TableCell>{row.rub}</TableCell>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.departamento}</TableCell>
                <TableCell>{row.municipio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default TrasladoExpediente;