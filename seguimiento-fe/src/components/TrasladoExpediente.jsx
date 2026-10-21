// src/components/TrasladoExpediente.jsx

import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Paper,
  Alert,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import { generarNotaExpediente } from "./NotaExpedientePDF";

function TrasladoExpediente({ usuario }) {
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [rows, setRows] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [correlativo, setCorrelativo] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/departamentos")
      .then((res) => res.json())
      .then((data) => setDepartamentos(data || []));
  }, []);

  const handleDepartamentoChange = async (idDepartamento) => {
    setDepartamento(idDepartamento);
    setMunicipio("");
    const res = await fetch(`http://localhost:3000/municipios/${idDepartamento}`);
    const data = await res.json();
    setMunicipios(data || []);
  };

  const handleBuscar = async () => {
    if (!departamento) {
      setMensaje("Debe seleccionar departamento");
      return;
    }

    try {
      const nombreDepto = departamentos.find(d => d.id_departamento === departamento)?.nombre;
      let url = `http://localhost:3000/expedientes_traslado`;
      const res = await fetch(url);
      const data = await res.json();

      const filtrados = (data || [])
        .filter(r => r.estatus === "Completo" &&
          r.departamento.toUpperCase() === nombreDepto.toUpperCase() &&
          (!municipio || r.municipio.toUpperCase() === municipio.toUpperCase())
        );

      setRows(filtrados);
      setMensaje(`Se encontraron ${filtrados.length} registros`);
    } catch (err) {
      setMensaje("Error al buscar expedientes traslado");
    }
  };

  const toggleSeleccion = (rub) => {
    setSeleccionados((prev) =>
      prev.includes(rub) ? prev.filter((x) => x !== rub) : [...prev, rub]
    );
  };

  const handleTrasladar = () => {
    if (seleccionados.length === 0) {
      setMensaje("Debe seleccionar al menos un expediente");
      return;
    }
    setOpenModal(true);
  };

  const confirmarTraslado = async () => {
    try {
      const nombreDepto = departamentos.find(d => d.id_departamento === departamento)?.nombre;
      const seleccionadosData = rows.filter(r => seleccionados.includes(r.rub));
      const numeroNota = `${nombreDepto}-${correlativo.padStart(4, "0")}-${new Date().getFullYear()}`;

      // Actualizar expedientes_seguimiento
      for (const r of seleccionadosData) {
        await fetch(`http://localhost:3000/expedientes_seguimiento/${r.id_carga}/${r.rub}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estatus: "Trasladado",
            nota_traslado: numeroNota
          })
        });
      }

      // Generar PDF
      generarNotaExpediente(
        nombreDepto,
        correlativo,
        seleccionadosData.map(r => ({
        rub: r.rub,
        nombre: r.nombre,
        departamento: r.departamento,
        municipio: r.municipio
        }))
      );

      setMensaje(`✅ Se trasladaron ${seleccionadosData.length} registros y se generó la nota ${numeroNota}`);
      setSeleccionados([]);
      setOpenModal(false);
      setTimeout(() => {
        handleBuscar();
      }, 5000);
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      setMensaje("Error al trasladar expedientes");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 950, margin: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        📄 Traslado de Expedientes
      </Typography>

      <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
        <InputLabel>Departamento</InputLabel>
        <Select
          value={departamento}
          onChange={(e) => handleDepartamentoChange(e.target.value)}
        >
          {departamentos.map((d) => (
            <MenuItem key={d.id_departamento} value={d.id_departamento}>
              {d.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
        <InputLabel>Municipio</InputLabel>
        <Select
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {municipios.map((m) => (
            <MenuItem key={m.id_municipio} value={m.nombre}>
              {m.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleBuscar}>
        Buscar
      </Button>

      {rows.length > 0 && (
        <Button variant="contained" sx={{ ml: 2 }} onClick={handleTrasladar}>
          Trasladar y Generar Nota
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
                <TableCell>{row.municipio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para correlativo */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Ingrese correlativo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Correlativo"
            type="text"
            fullWidth
            value={correlativo}
            onChange={(e) => setCorrelativo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={confirmarTraslado} variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TrasladoExpediente;