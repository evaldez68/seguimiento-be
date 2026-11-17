// src/components/DetalleEnvioGrid.jsx
import React, { useState, useEffect } from "react";
import {Box,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Button,TextField,FormControl,InputLabel,Select,MenuItem} from "@mui/material";

function DetalleEnvioGrid({ idMaestro, onChange }) {
  const usuarioLogin = JSON.parse(localStorage.getItem("usuario"));
  const [detalle, setDetalle] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [subprogramas, setSubprogramas] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo_documento: "",
    numero_documento: "",
    programa: "",
    subprograma: "",
  });

  useEffect(() => {
    fetch("https://seguimiento-be-production-7e17.up.railway.app/programas")
      .then((res) => res.json())
      .then((data) => setProgramas(data));

    fetch("https://seguimiento-be-production-7e17.up.railway.app/subprogramas")
      .then((res) => res.json())
      .then((data) => setSubprogramas(data));

    if (idMaestro) {
      cargarDetalle();
    }
  }, [idMaestro]);

  const cargarDetalle = async () => {
    const res = await fetch("https://seguimiento-be-production-7e17.up.railway.app/detalle_envios");
    const data = await res.json();
    const filtrados = data.filter((d) => d.id_maestro_envio === idMaestro);
    setDetalle(filtrados);
    if (onChange) onChange(filtrados);
  };

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const agregarDetalle = async () => {
    // ✅ Validación: todos los campos deben tener valor
    if (
      !nuevo.tipo_documento.trim() ||
      !nuevo.numero_documento.trim() ||
      !nuevo.programa.trim() ||
      !nuevo.subprograma.trim()
    ) {
      alert("Debe completar todos los campos antes de grabar el detalle.");
      return;
    }

    const payload = { ...nuevo, id_maestro_envio: idMaestro };
    const respDetalle = await fetch("https://seguimiento-be-production-7e17.up.railway.app/detalle_envios",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),});
    const detalleGrabado = await respDetalle.json();    

    console.log("Detalle grabado:", detalleGrabado);
    await fetch("https://seguimiento-be-production-7e17.up.railway.app/seguimiento_documentos",{
    method: "POST",
    headers: {"Content-Type": "application/json",},
    body: JSON.stringify([{
        id_envio: idMaestro,
        id_proceso: 8,
        id_documento: detalleGrabado.id,
        usuario: usuarioLogin.nombre,
        recibido: true,
        rechazado: false,},]),});    

    await cargarDetalle();
    setNuevo({ tipo_documento: "", numero_documento: "", programa: "", subprograma: "" });
  };

  return (
    <div>
      <h3 style={{ textAlign: "center", color: "#1976d2" }}>
         Detalle de Documentos
      </h3>
      <TableContainer component={Paper} sx={{borderRadius:3,mt:2}}>
      <Table>
        <TableHead sx={{"& th:first-of-type": {borderTopLeftRadius: "12px"},"& th:last-of-type": {borderTopRightRadius: "12px"}, 
              "& th":{borderRight:"1px solid #D3D3D3"}, "& th:last-child":{borderRight:"none"}}}>
          <TableRow>
            <TableCell sx={{backgroundColor:"#1976d2",color:"white",fontWeight:"bold"}} align="center">Tipo Documento</TableCell>
            <TableCell sx={{backgroundColor:"#1976d2",color:"white",fontWeight:"bold"}} align="center">Número Documento</TableCell>
            <TableCell sx={{backgroundColor:"#1976d2",color:"white",fontWeight:"bold"}} align="center">Programa</TableCell>
            <TableCell sx={{backgroundColor:"#1976d2",color:"white",fontWeight:"bold"}} align="center">Subprograma</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalle.map((d, i) => (
            <TableRow key={i}>
              <TableCell style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{d.tipo_documento}</TableCell>
              <TableCell style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{d.numero_documento}</TableCell>
              <TableCell style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{d.programa}</TableCell>
              <TableCell style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{d.subprograma}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>
      <div style={{display: "flex", gap: "10px", alignItems: "center", marginTop: "15px"}}>
        <FormControl size="small" sx={{minWidth:180}}>
        <InputLabel>Tipo Documento</InputLabel>
        <Select name="tipo_documento" value={nuevo.tipo_documento} label="Tipo Documento" onChange={handleChange}>
          <MenuItem value="Oficio">Oficio</MenuItem>
          <MenuItem value="Providencia">Providencia</MenuItem>
          <MenuItem value="Memorándum">Memorándum</MenuItem>
          <MenuItem value="Resolución">Resolución</MenuItem>
          <MenuItem value="Informe">Informe</MenuItem>
          <MenuItem value="Circular">Circular</MenuItem>
          <MenuItem value="Expediente">Expediente</MenuItem>
        </Select>
        </FormControl>
        <TextField size="small" label="Número Documento" name="numero_documento" value={nuevo.numero_documento} onChange={handleChange}/>
        <FormControl size="small" sx={{minWidth:220}}>
          <InputLabel>Programa</InputLabel>
          <Select name="programa" value={nuevo.programa} label="Programa" onChange={handleChange}>
            {programas.map((p) => (
            <MenuItem key={p.id} value={p.nombre_programa}>{p.nombre_programa}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{minWidth:220}}>
          <InputLabel>Sub-Programa</InputLabel>
          <Select name="subprograma" value={nuevo.subprograma} label="Subprograma" onChange={handleChange}>
            {subprogramas.map((s) => (
            <MenuItem key={s.id} value={s.nombre}>{s.nombre}</MenuItem>))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={agregarDetalle} sx={{height:"40px",borderRadius:3,px:3,textTransform:"none",fontWeight:"bold"}}>
          Agregar
        </Button>
      </div>
    </div>
  );
}

export default DetalleEnvioGrid;