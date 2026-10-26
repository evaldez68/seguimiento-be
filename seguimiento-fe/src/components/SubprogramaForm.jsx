// src/components/SubprogramaForm.jsx

import React, { useState, useEffect } from "react";

function SubprogramaForm({ onSubprogramaAgregado }) {
  const [formData, setFormData] = useState({
    id_programa: "",
    nombre: "",
    encargado: "",
    piso_entrega: "",
  });

  const [programas, setProgramas] = useState([]);

  // Cargar programas para el select
  useEffect(() => {
    fetch("https://seguimiento-be-production-7e17.up.railway.app/programas")
      .then((res) => res.json())
      .then((data) => setProgramas(data))
      .catch((err) => console.error("Error cargando programas:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://seguimiento-be-production-7e17.up.railway.app/subprogramas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el subprograma");
      }

      onSubprogramaAgregado(); // refresca la tabla y cierra modal
    } catch (err) {
      console.error(err);
      alert("Error al guardar el subprograma");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h3>Agregar Subprograma</h3>

      <label>Programa:</label>
      <select
        name="id_programa"
        value={formData.id_programa}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione un programa</option>
        {programas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre_programa}
          </option>
        ))}
      </select>

      <label>Nombre:</label>
      <input
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />

      <label>Encargado:</label>
      <input
        type="text"
        name="encargado"
        value={formData.encargado}
        onChange={handleChange}
      />

      <label>Piso Entrega:</label>
      <input
        type="text"
        name="piso_entrega"
        value={formData.piso_entrega}
        onChange={handleChange}
      />

      <button type="submit" className="guardar">Guardar</button>
    </form>
  );
}

export default SubprogramaForm;