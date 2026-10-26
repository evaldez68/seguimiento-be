// src/components/RolForm.jsx

import React, { useState } from "react";

function RolForm({ onRolAgregado }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://seguimiento-be-production-7e17.up.railway.app/roles_seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el rol");
      }

      onRolAgregado(); // refresca la tabla y cierra modal
    } catch (err) {
      console.error(err);
      alert("Error al guardar el rol");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h3>Agregar Rol</h3>

      <label>Nombre:</label>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
      <label>Descripción:</label>
      <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
      <button type="submit" className="guardar">Guardar</button>
    </form>
  );
}

export default RolForm;