// src/components/ProgramaForm.jsx

import React, { useState } from "react";

function ProgramaForm({ onProgramaAgregado }) {
  const [nombre_programa, setNombrePrograma] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/programas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_programa }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el programa");
      }

      onProgramaAgregado(); // refresca la tabla y cierra modal
    } catch (err) {
      console.error(err);
      alert("Error al guardar el programa");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h3>Agregar Programa</h3>

      <label>Nombre del Programa:</label>
      <input
        type="text"
        name="nombre_programa"
        value={nombre_programa}
        onChange={(e) => setNombrePrograma(e.target.value)}
        required
      />

      <button type="submit" className="guardar">Guardar</button>
    </form>
  );
}

export default ProgramaForm;