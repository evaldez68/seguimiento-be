// src/components/ExpedientesCoordinacion.jsx

import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Paper,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ExportExcel from "./ExportExcel";

function ExpedientesCoordinacion() {
  const [departamento, setDepartamento] = useState("");
  const [idCarga, setIdCarga] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [rows, setRows] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://seguimiento-be-production-7e17.up.railway.app/departamentos")
      .then(res => res.json())
      .then(data => setDepartamentos(data));

    fetch("https://seguimiento-be-production-7e17.up.railway.app/expedientes/cargas")
      .then(res => res.json())
      .then(data => setCargas(data));
  }, []);

  const handleDepartamentoChange = async (idDepartamento) => {
    setDepartamento(idDepartamento);
    setMunicipio("");
    try {
      const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/municipios/${idDepartamento}`);
      const data = await res.json();
      setMunicipios(data || []);
    } catch (err) {
      console.error(err);
      setMunicipios([]);
    }
  };

  const handleBuscar = async () => {
    if (!departamento || !idCarga) {
      setMensaje("Debe seleccionar departamento e id_carga");
      return;
    }
    setLoading(true);
    try {
      const nombreDepto = departamentos.find(d => d.id_departamento === departamento)?.nombre;
      let url = `https://seguimiento-be-production-7e17.up.railway.app/expedientes/coordinacion/${idCarga}/${nombreDepto}`;
      if (municipio) {
        url += `/${municipio}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setRows(data);
      setMensaje(`Se encontraron ${data.length} registros`);
    } catch (err) {
      console.error(err);
      setMensaje("Error al buscar expedientes");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearArchivoRutas = async () => {
    if (!departamento || !idCarga) {
      setMensaje("Debe seleccionar departamento e id_carga");
      return;
    }

    setLoading(true);
    try {
      const nombreDepto = departamentos.find(d => d.id_departamento === departamento)?.nombre;
      let url = `https://seguimiento-be-production-7e17.up.railway.app/expedientes/rutas/${idCarga}/${nombreDepto}`;
      if (municipio) {
        url += `/${municipio}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      // Generar CSV
      const headers = ["Departamento", "Municipio", "Nombre", "Geolocalizacion"];
      const csvRows = [headers.join(",")];
      data.forEach(r => {
        csvRows.push(
          `${r.departamento},${r.municipio},${r.nombre},${r.geolocalizacion}`
        );
      });
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csvContent);
      link.download = "rutas.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMensaje("Archivo rutas.csv generado correctamente");
    } catch (err) {
      console.error(err);
      setMensaje("Error al generar archivo de rutas");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "rub", headerName: "RUB", width: 120 },
    { field: "departamento", headerName: "Departamento", width: 150 },
    { field: "municipio", headerName: "Municipio", width: 150 },
    { field: "estatus", headerName: "Estatus", width: 120 },
    { field: "nombre", headerName: "Nombre Completo", width: 250 },
  ];

  const exportColumns =
    rows.length > 0
      ? Object.keys(rows[0]).filter(
          key => key !== "id" && key !== "created_at" && key !== "updated_at"
        )
      : [];

  return (
    <Paper sx={{ p: 3, maxWidth: 900, margin: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ color: "var(--guatemala-dark)", mb: 2 }}>
        📑 Expedientes por Coordinación
      </Typography>

      <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
        <InputLabel>Departamento</InputLabel>
        <Select value={departamento} onChange={(e) => handleDepartamentoChange(e.target.value)}>
          {departamentos.map((d) => (
            <MenuItem key={d.id_departamento} value={d.id_departamento}>
              {d.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150, mr: 2 }} size="small">
        <InputLabel>Municipio</InputLabel>
        <Select value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {municipios.map((m) => (
            <MenuItem key={m.id_municipio} value={m.nombre}>
              {m.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150, mr: 2 }} size="small">
        <InputLabel>Id_Carga</InputLabel>
        <Select value={idCarga} onChange={(e) => setIdCarga(e.target.value)}>
          {cargas.map((c) => (
            <MenuItem key={c.id_carga} value={c.id_carga}>
              {c.id_carga}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button className="editar" onClick={handleBuscar} sx={{ mr: 2 }}>
        Buscar
      </Button>

      <Button className="excel" onClick={handleCrearArchivoRutas}>
        Crear Archivo Rutas
      </Button>

      {rows.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          <ExportExcel
            data={rows}
            columns={exportColumns.map((col) => ({
              header: col.toUpperCase(),
              key: col,
            }))}
            fileName="expedientes"
            className="excel"
          />
        </div>
      )}

      {mensaje && (
        <Alert severity={mensaje.includes("Error") ? "error" : "info"} sx={{ mt: 2 }}>
          {mensaje}
        </Alert>
      )}

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Cargando expedientes...
          </Typography>
        </div>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{ mt: 2 }}
        />
      )}
    </Paper>
  );
}

export default ExpedientesCoordinacion;