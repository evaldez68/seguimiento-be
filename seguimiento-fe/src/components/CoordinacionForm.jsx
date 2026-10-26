// src/components/CoordinacionForm.jsx
import React, { useState } from "react";

function CoordinacionForm({ onCoordinacionAgregada }) {
  const [formData, setFormData] = useState({
    departamento: "",
    coordinador: "",
    direccion_fisica: "",
    contacto: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("https://seguimiento-be-production-7e17.up.railway.app/coordinaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onCoordinacionAgregada();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la coordinación");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h3>Agregar Coordinación</h3>

      <label>Departamento:</label>
      <input type="text" name="departamento" value={formData.departamento} onChange={handleChange} required />

      <label>Coordinador:</label>
      <input type="text" name="coordinador" value={formData.coordinador} onChange={handleChange} required />

      <label>Dirección Física:</label>
      <textarea name="direccion_fisica" value={formData.direccion_fisica} onChange={handleChange} required />

      <label>Contacto:</label>
      <input type="text" name="contacto" value={formData.contacto} onChange={handleChange} required />

      <button type="submit" className="guardar">Guardar</button>
    </form>
  );
}

export default CoordinacionForm;