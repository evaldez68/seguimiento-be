// scr/components/HistorialDocumento.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import dayjs from "dayjs";

const HistorialDocumento = () => {
  const [numeroDoc, setNumeroDoc] = useState("");
  const [listaDocs, setListaDocs] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [alertaGlobal, setAlertaGlobal] = useState(null);

  // 🔹 Cargar lista de documentos únicos al montar
  useEffect(() => {
    const cargarDocumentos = async () => {
      const res = await fetch(`http://seguimiento-be-production-7e17.up.railway.app/seguimiento_historial`);
      const data = await res.json();
      const unicos = [...new Set(data.map(d => d.numero_documento))];
      setListaDocs(unicos);
    };
    cargarDocumentos();
  }, []);

  const buscarHistorial = async (doc) => {
    const res = await fetch(`http://seguimiento-be-production-7e17.up.railway.app/seguimiento_historial/historial/${doc}`);
    const data = await res.json();
    setHistorial(data);

    // 🔹 Verificar si hay algún atraso en el historial
    const atrasado = data.find(item => {
      const fechaMovimiento = dayjs(`${item.fecha} ${item.hora}`);
      const dias = dayjs().diff(fechaMovimiento, "day");
      return dias >= 5;
    });

    if (atrasado) {
      setAlertaGlobal(
        `Documento ${atrasado.numero_documento} lleva más de 5 días en el proceso ${atrasado.nombre_proceso}`
      );
    } else {
      setAlertaGlobal(null);
    }
  };

  const handleSelectDoc = (e) => {
    const value = e.target.value;
    setNumeroDoc(value);
    buscarHistorial(value);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Select de documentos únicos */}
      <FormControl sx={{ minWidth: 300, mb: 2 }}>
        <InputLabel>Seleccione Documento</InputLabel>
        <Select
          value={numeroDoc}
          onChange={handleSelectDoc}
        >
          {listaDocs.map((doc, idx) => (
            <MenuItem key={idx} value={doc}>
              {doc}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Timeline con alertas */}
      <Timeline position="alternate">
        {historial.map((item, idx) => {
          const fechaMovimiento = dayjs(`${item.fecha} ${item.hora}`);
          const dias = dayjs().diff(fechaMovimiento, "day");
          const alerta = dias >= 5;

          return (
            <TimelineItem key={idx}>
              <TimelineSeparator>
                <TimelineDot color={alerta ? "error" : "primary"} />
                {idx < historial.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="subtitle1">
                  {item.fecha} {item.hora}
                </Typography>
                <Typography variant="body2">Usuario: {item.usuario}</Typography>
                <Typography variant="body2">Proceso: {item.nombre_proceso}</Typography>
                <Typography variant="body2">
                  Tipo Doc: {item.tipo_documento} — {item.numero_documento}
                </Typography>
                <Typography variant="body2">
                  Entrega: {item.tipo_entrega} | Guía: {item.no_guia} | Courier: {item.empresa_courier}
                </Typography>

                {alerta && (
                  <Typography variant="body2" color="error">
                    ⚠ Documento lleva más de 5 días en este proceso
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>

      {/* Snackbar flotante para alertas globales */}
      <Snackbar
        open={!!alertaGlobal}
        autoHideDuration={6000}
        onClose={() => setAlertaGlobal(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          {alertaGlobal}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistorialDocumento;