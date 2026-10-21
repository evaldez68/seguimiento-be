// src/components/ActualizarExpedientes.jsx

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
  FormControl
} from "@mui/material";

function ActualizarExpedientes({ usuario }) { // 👈 recibe usuario del login
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [rows, setRows] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");

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
      let url = `http://localhost:3000/expedientes/filtrar/${nombreDepto.toUpperCase()}`;
      if (municipio) {
        url += `/${municipio.toUpperCase()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const filtrados = (data || [])
        .filter(r => r.estatus && ["Pendiente", "Nuevo"].includes(r.estatus.trim()))
        .map(r => ({
          ...r,
          nombre: [
            r.primer_nombre,
            r.segundo_nombre,
            r.tercer_nombre,
            r.primer_apellido,
            r.segundo_apellido,
            r.apellido_casada,
          ].filter(Boolean).join(" "),
        }));

      setRows(filtrados);
      setMensaje(`Se encontraron ${filtrados.length} registros`);
    } catch (err) {
      setMensaje("Error al buscar expedientes");
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleActualizar = async () => {
    if (seleccionados.length === 0) {
      setMensaje("Debe seleccionar al menos un expediente");
      return;
    }

    try {
      // 1) Actualizar estatus en expedientes
      const payload = {
        ids: seleccionados.map(id => Number(id)),
        nuevoEstatus: "Completo"
      };

      const res = await fetch("http://localhost:3000/expedientes_estatus/actualizar-estatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const cantidad = result.cantidad || 0;

        // 2) Insertar en expedientes_seguimiento
        const seleccionadosData = rows.filter(r => seleccionados.includes(r.id));
        const inserts = seleccionadosData.map(r => ({
          id_carga: r.id_carga,
          rub: r.rub,
          departamento: r.departamento,
          municipio: r.municipio,
          estatus: "Completo",
          usuario: usuario, // 👈 usuario del login
          updated_at: new Date().toISOString()
        }));

        await fetch("http://localhost:3000/expedientes_seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inserts)
        });

        setMensaje(`✅ Se actualizaron ${cantidad} registros y se insertaron en seguimiento`);
        setSeleccionados([]);
        setTimeout(() => {
          handleBuscar();
        }, 5000);
      } else {
        setMensaje(result.error || result.mensaje || "Error al actualizar estatus");
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      setMensaje("Error de conexión al actualizar");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 950, margin: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        🔄 Actualizar Expedientes
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
        <Button variant="contained" sx={{ ml: 2 }} onClick={handleActualizar}>
          Actualizar Estatus
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
              <TableCell>ID</TableCell>
              <TableCell>RUB</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Municipio</TableCell>
              <TableCell>Estatus</TableCell>
              <TableCell>Nombre Completo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox
                    checked={seleccionados.includes(row.id)}
                    onChange={() => toggleSeleccion(row.id)}
                  />
                </TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.rub}</TableCell>
                <TableCell>{row.departamento}</TableCell>
                <TableCell>{row.municipio}</TableCell>
                <TableCell>{row.estatus}</TableCell>
                <TableCell>{row.nombre}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ActualizarExpedientes;