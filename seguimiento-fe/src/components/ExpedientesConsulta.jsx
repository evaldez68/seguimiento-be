// src/components/ExpedientesConsulta.jsx

import React, { useState } from 'react';
import { Typography, Snackbar, Alert, Paper} from "@mui/material";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ExpedientesConsulta = () => {
  const [campo, setCampo] = useState('RUB');
  const [valor, setValor] = useState('');
  const [rows, setRows] = useState([]);

  const buscarExpedientes = async () => {
    const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/expedientes/consulta?campo=${campo}&valor=${valor}`);
    const data = await res.json();
    setRows(data);
  };

  const columns = [
    { field: 'rub', headerName: 'RUB', width: 120 },
    { field: 'nombre', headerName: 'Nombre', width: 250 }, // ya concatenado en la vista
    { field: 'departamento', headerName: 'Departamento', width: 250 },
    { field: 'municipio', headerName: 'Municipio', width: 250 },
    { field: 'estatus_hogar', headerName: 'Estatus Hogar', width: 150 },
    { field: 'beneficio_familia', headerName: 'Beneficio Familia', width: 180 },
    { field: 'observacion', headerName: 'Observación', width: 200 },
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px", marginTop: "20px", color: "var(--guatemala-blue)" }}>
        Consulta de Expedientes
      </h2>
      <FormControl style={{ minWidth: 150, marginRight: 10, marginTop: 20, marginBottom: 20 }}>
        <InputLabel>Campo</InputLabel>
        <Select value={campo} onChange={(e) => setCampo(e.target.value)}>
          <MenuItem value="rub">RUB</MenuItem>
          <MenuItem value="primer_apellido">Primer Apellido</MenuItem>
          <MenuItem value="codigo_familia">Código Familia</MenuItem>
          <MenuItem value="identificacion">DPI</MenuItem>
        </Select>
      </FormControl>

      <TextField 
        label="Valor" 
        value={valor} 
        onChange={(e) => setValor(e.target.value)} 
        style={{ marginRight: 10, marginTop: 20, marginBottom: 20 }} 
      />

      <Button style={{ marginRight: 10, marginTop: 20, marginBottom: 20 }} variant="contained" onClick={buscarExpedientes}>Buscar</Button>

      <DataGrid rows={rows} columns={columns} getRowId={(row) => row.id} />
    </div>
  );
};

export default ExpedientesConsulta;