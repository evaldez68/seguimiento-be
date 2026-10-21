// src/components/ProcesoForm.jsx

import React, { useState } from "react";

function ProcesoForm({ onProcesoAgregado }) {
  const [nombreProceso, setNombreProceso] = useState("");
  const [encargado, setEncargado] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoProceso = { nombre_proceso: nombreProceso, encargado };

    try {
      const res = await fetch("http://localhost:3000/procesos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProceso),
      });

      if (res.ok) {
        onProcesoAgregado();
        setNombreProceso("");
        setEncargado("");
      } else {
        alert("Error al guardar el proceso");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h3>Agregar Proceso</h3>

      <label>Nombre del Proceso:</label>
      <input
        type="text"
        value={nombreProceso}
        onChange={(e) => setNombreProceso(e.target.value)}
        required
      />

      <label>Encargado:</label>
      <input
        type="text"
        value={encargado}
        onChange={(e) => setEncargado(e.target.value)}
        required
      />

      <button type="submit" className="guardar">
        Guardar
      </button>
    </form>
  );
}

export default ProcesoForm;