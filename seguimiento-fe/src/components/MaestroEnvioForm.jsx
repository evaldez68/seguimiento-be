// src/components/MaestroEnvioForm.jsx

import React, { useState, useEffect } from "react";
import {Box,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Button,TextField,FormControl,InputLabel,Select,MenuItem} from "@mui/material";

function MaestroEnvioForm({ onGrabar, maestroInicial }) {
  const [formData, setFormData] = useState({
    id_coordinacion: "",
    correlativo: "",
    tipo_entrega: "Presencial",
    no_guia: "",
    empresa_courier: "Presencial", // Valor por defecto para "Presencial"
    id_courier: "999", // Valor por defecto para "No aplica"
  });

  const [coordinaciones, setCoordinaciones] = useState([]);
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    // 🔹 Cargar coordinaciones
    fetch("https://seguimiento-be-production-7e17.up.railway.app/coordinaciones")
      .then((res) => res.json())
      .then((data) => setCoordinaciones(data));

    // 🔹 Cargar couriers
    fetch("https://seguimiento-be-production-7e17.up.railway.app/couriers")
      .then((res) => res.json())
      .then((data) => setCouriers(data));

    // 🔹 Si viene maestroInicial (buscar nota), usarlo
    if (maestroInicial && maestroInicial.correlativo) {
      setFormData((prev) => ({ ...prev, ...maestroInicial }));
    } else {
      // 🔹 Si es nueva nota, pedir correlativo al backend
      fetch("https://seguimiento-be-production-7e17.up.railway.app/maestro_envios/ultimo-correlativo")
        .then((res) => res.json())
        .then((info) => {
          setFormData((prev) => ({ ...prev, correlativo: info.siguiente }));
        });
    }
  }, [maestroInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tipo_entrega" && value === "Presencial") {
      setFormData({
        ...formData,
        tipo_entrega: "Presencial",
        id_courier: 999,
        empresa_courier: "Presencial",
        no_guia: ""});
      return;
    }
    setFormData({
    ...formData, [name]: value,});};

  const handleCourierChange = (e) => {
    const id = parseInt(e.target.value, 10);
    const courier = couriers.find(c => c.id_courier === id);
    setFormData({
      ...formData,
      id_courier: id,
      empresa_courier: courier ? courier.nombre : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fecha = new Date();
    const payload = {
      ...formData,
      fecha: fecha.toISOString().split("T")[0],
      hora: fecha.toTimeString().split(" ")[0],
    };

    const res = await fetch("https://seguimiento-be-production-7e17.up.railway.app/maestro_envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    onGrabar(data);
  };

  return (
  <div className="contenedor-principal">
    <form onSubmit={handleSubmit} className="formulario">
      <h3 style={{ textAlign: "center", color: "#1976d2" }}>
         Ingreso Maestro de Envío
      </h3>
      <FormControl size="small" sx={{minWidth:300}}>
        <InputLabel>Coordinación</InputLabel>
        <Select name="id_coordinacion" value={formData.id_coordinacion} label="Coordinación" onChange={handleChange}>
          {coordinaciones.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.departamento}</MenuItem>))}
        </Select>
      </FormControl>
      <TextField size="small" label="Correlativo" name="correlativo" value={formData.correlativo} InputProps={{readOnly:true}} sx={{width:150, ml:1,"& .MuiInputBase-input":{fontWeight:"bold",color:"#1976d2"}}} />
      <FormControl size="small" sx={{minWidth:300, ml:1}}>
        <InputLabel>Tipo de Entrega</InputLabel>
        <Select name="tipo_entrega" value={formData.tipo_entrega} label="Tipo de Entrega" onChange={handleChange}>
          <MenuItem value="Presencial">Presencial</MenuItem>
          <MenuItem value="Courier">Courier</MenuItem>
        </Select>
      </FormControl>
      {formData.tipo_entrega === "Courier" && (
        <>
          <FormControl size="small" sx={{minWidth:300, ml:1}}>
            <InputLabel>Empresa Courier</InputLabel>
            <Select name="id_courier" value={formData.id_courier} label="Empresa Courier" onChange={handleCourierChange} required>
              <MenuItem value="">Seleccione courier</MenuItem>
              {couriers.map((c) => (
                <MenuItem key={c.id_courier} value={c.id_courier}>{c.nombre}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField size="small" label="No. Guia" name="no_guia" value={formData.no_guia} sx={{width:150, ml:1}} />
        </>
      )}
      <Button type="submit" variant="contained" size="large" sx={{ml:2,borderRadius:3,px:3,textTransform:"none",fontWeight:"bold"}}>Grabar</Button>
    </form>
  </div>
  );
}

export default MaestroEnvioForm;