// src/components/ConsultaDocumentos.jsx

import React, { useState, useEffect } from "react";
import {  Box,  TextField,  Button,  Select,  MenuItem,  InputLabel,  FormControl,  Table,  TableHead,  TableRow,  TableCell,  TableBody,} from "@mui/material";
import dayjs from "dayjs";

const ConsultaDocumentos = () => {
  const [tipoConsulta, setTipoConsulta] = useState("documento"); // default: No. Documento
  const [numeroDoc, setNumeroDoc] = useState("");
  const [correlativo, setCorrelativo] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [programa, setPrograma] = useState("");
  const [listaDocs, setListaDocs] = useState([]);
  const [programas, setProgramas] = useState([]);

  // Cargar programas
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


  const buscarPorDocumento = async (num) => {
    const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/seguimiento_consulta/documento/${num}`);
    const data = await res.json();
    setDocumentos(data);
  };

  const buscarPorCorrelativo = async () => {
    const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/seguimiento_consulta/correlativo/${correlativo}`);
    const data = await res.json();
    setDocumentos(data);

    // 🔹 Filtrar duplicados de numero_documento
    const unicos = [...new Set(data.map(d => d.numero_documento))];
    setListaDocs(unicos);
  };

  const buscarPorPrograma = async () => {
    const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/seguimiento_consulta/programa/${programa}`);
    const data = await res.json();
    setDocumentos(data);};

  // 🔹 Si el tipo es Documento, dispara la búsqueda automáticamente
  const handleNumeroDocChange = (e) => {
    const value = e.target.value;
    setNumeroDoc(value);
    if (tipoConsulta === "documento" && value.trim() !== "") {
      buscarPorDocumento(value);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Selector de tipo de consulta */}
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Tipo de Consulta</InputLabel>
        <Select value={tipoConsulta} onChange={(e) => {
            setTipoConsulta(e.target.value);
            setDocumentos([]);
            setListaDocs([]);
            setNumeroDoc("");
            setCorrelativo("");
            setPrograma("");}}>
          <MenuItem value="programa">Programa</MenuItem>
          <MenuItem value="documento">No. Documento</MenuItem>
            </Select>
              </FormControl>
                {tipoConsulta === "programa" && (
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>Programa</InputLabel>
                <Select value={programa} label="Programa" onChange={(e) => setPrograma(e.target.value)}>
                 <MenuItem value=""><em>-- Seleccione Programa --</em></MenuItem>
                 {programas.map((p) => (<MenuItem key={p.nombre_programa} value={p.nombre_programa}> {p.nombre_programa}</MenuItem>))}
                </Select>
              </FormControl>
                  <Button variant="contained" onClick={buscarPorPrograma}>Buscar</Button>
                </Box>)}
                {tipoConsulta === "documento" && (
                  <TextField label="Número Documento" value={numeroDoc} onChange={handleNumeroDocChange} x={{ mb: 2, width: "300px" }}/>)}
                {tipoConsulta === "correlativo" && (
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField label="Correlativo" value={correlativo} onChange={(e) => setCorrelativo(e.target.value)}/>
                <Button variant="contained" onClick={buscarPorCorrelativo}>Buscar</Button>
                 {listaDocs.length > 0 && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Documentos</InputLabel>
                    <Select value={numeroDoc} onChange={(e) => {setNumeroDoc(e.target.value); buscarPorDocumento(e.target.value);}}>
                      {listaDocs.map((doc, idx) => (
                      <MenuItem key={idx} value={doc}>{doc}</MenuItem>))}
                    </Select>
                </FormControl>)}
               </Box>)}
      {/* GRID de resultados */}
      <Table>
        <TableHead sx={{"& th:first-of-type": {borderTopLeftRadius: "12px"},"& th:last-of-type": {borderTopRightRadius: "12px"}, "& th":{borderRight:"1px solid #D3D3D3"}, "& th:last-child":{borderRight:"none"}}}>
          <TableRow sx={{"& td": {borderBottom: "8px solid #fff"}}}>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Proceso</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Fecha</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Hora</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Tipo Doc</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Número Doc</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Origen</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Tipo Entrega</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">No. Guía</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Courier</TableCell>
            <TableCell sx={{ color: "#FFF", fontWeight: 700 }} align="center">Semáforo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{"& td":{fontSize:"16px", fontWeight: 600}}}>
          {documentos.map((row, idx) => {
            const fechaMovimiento = dayjs(`${row.fecha} ${row.horagt}`);
            const dias = dayjs().diff(fechaMovimiento, "day");

            let color = "green";
            if (dias >= 3 && dias <= 4) color = "gold";
            if (dias >= 5) color = "red";

            return (
              <TableRow key={idx}>
                <TableCell>{row.nombre_proceso}</TableCell>
                <TableCell>{row.fecha_proceso}</TableCell>
                <TableCell>{row.hora_proceso}</TableCell>
                <TableCell>{row.tipo_documento}</TableCell>
                <TableCell>{row.numero_documento}</TableCell>
                <TableCell>{row.departamento_origen}</TableCell>
                <TableCell>{row.tipo_entrega}</TableCell>
                <TableCell>{row.no_guia ? (<a href={`${row.url_tracking}${row.no_guia}`} target="_blank" rel="noopener noreferrer">{row.no_guia}</a>) : ("-")}</TableCell>
                <TableCell>{row.empresa_courier}</TableCell>
                <TableCell><Box sx={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: color, margin: "auto",}}/></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ConsultaDocumentos;