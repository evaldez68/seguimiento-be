// src/components/ConsultaDocumentos.jsx

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import dayjs from "dayjs";

const ConsultaDocumentos = () => {
  const [tipoConsulta, setTipoConsulta] = useState("documento"); // default: No. Documento
  const [numeroDoc, setNumeroDoc] = useState("");
  const [correlativo, setCorrelativo] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [listaDocs, setListaDocs] = useState([]);

  const buscarPorDocumento = async (num) => {
    const res = await fetch(`http://seguimiento-be-production-7e17.up.railway.app/seguimiento_consulta/documento/${num}`);
    const data = await res.json();
    setDocumentos(data);
  };

  const buscarPorCorrelativo = async () => {
    const res = await fetch(`http://seguimiento-be-production-7e17.up.railway.app/seguimiento_consulta/correlativo/${correlativo}`);
    const data = await res.json();
    setDocumentos(data);

    // 🔹 Filtrar duplicados de numero_documento
    const unicos = [...new Set(data.map(d => d.numero_documento))];
    setListaDocs(unicos);
  };

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
        <Select
          value={tipoConsulta}
          onChange={(e) => {
            setTipoConsulta(e.target.value);
            setDocumentos([]);
            setListaDocs([]);
            setNumeroDoc("");
            setCorrelativo("");
          }}
        >
          <MenuItem value="documento">No. Documento</MenuItem>
          <MenuItem value="correlativo">Correlativo</MenuItem>
        </Select>
      </FormControl>

      {/* Campos según tipo de consulta */}
      {tipoConsulta === "documento" && (
        <TextField
          label="Número Documento"
          value={numeroDoc}
          onChange={handleNumeroDocChange}
          sx={{ mb: 2, width: "300px" }}
        />
      )}

      {tipoConsulta === "correlativo" && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Correlativo"
            value={correlativo}
            onChange={(e) => setCorrelativo(e.target.value)}
          />
          <Button variant="contained" onClick={buscarPorCorrelativo}>
            Buscar
          </Button>

          {listaDocs.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Documentos</InputLabel>
              <Select
                value={numeroDoc}
                onChange={(e) => {
                  setNumeroDoc(e.target.value);
                  buscarPorDocumento(e.target.value);
                }}
              >
                {listaDocs.map((doc, idx) => (
                  <MenuItem key={idx} value={doc}>
                    {doc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      {/* GRID de resultados */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora GT</TableCell>
            <TableCell>Proceso</TableCell>
            <TableCell>Tipo Doc</TableCell>
            <TableCell>Número Doc</TableCell>
            <TableCell>Tipo Entrega</TableCell>
            <TableCell>No. Guía</TableCell>
            <TableCell>Courier</TableCell>
            <TableCell>Semáforo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documentos.map((row, idx) => {
            const fechaMovimiento = dayjs(`${row.fecha} ${row.horagt}`);
            const dias = dayjs().diff(fechaMovimiento, "day");

            let color = "green";
            if (dias >= 3 && dias <= 4) color = "gold";
            if (dias >= 5) color = "red";

            return (
              <TableRow key={idx}>
                <TableCell>{row.usuario}</TableCell>
                <TableCell>{row.fecha}</TableCell>
                <TableCell>{row.horagt}</TableCell>
                <TableCell>{row.nombre_proceso}</TableCell>
                <TableCell>{row.tipo_documento}</TableCell>
                <TableCell>{row.numero_documento}</TableCell>
                <TableCell>{row.tipo_entrega}</TableCell>
                <TableCell>
                  {row.no_guia ? (
                    <a
                      href={`${row.url_tracking}${row.no_guia}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row.no_guia}
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{row.empresa_courier}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: color,
                      margin: "auto",
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ConsultaDocumentos;