// src/components/MaestroEnvioForm.jsx

import React, { useState, useEffect } from "react";

function MaestroEnvioForm({ onGrabar, maestroInicial }) {
  const [formData, setFormData] = useState({
    id_coordinacion: "",
    correlativo: "",
    tipo_entrega: "Presencial",
    no_guia: "",
    empresa_courier: "",
    id_courier: "",
  });

  const [coordinaciones, setCoordinaciones] = useState([]);
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    // 🔹 Cargar coordinaciones
    fetch("http://localhost:3000/coordinaciones")
      .then((res) => res.json())
      .then((data) => setCoordinaciones(data));

    // 🔹 Cargar couriers
    fetch("http://localhost:3000/couriers")
      .then((res) => res.json())
      .then((data) => setCouriers(data));

    // 🔹 Si viene maestroInicial (buscar nota), usarlo
    if (maestroInicial && maestroInicial.correlativo) {
      setFormData((prev) => ({ ...prev, ...maestroInicial }));
    } else {
      // 🔹 Si es nueva nota, pedir correlativo al backend
      fetch("http://localhost:3000/maestro_envios/ultimo-correlativo")
        .then((res) => res.json())
        .then((info) => {
          setFormData((prev) => ({ ...prev, correlativo: info.siguiente }));
        });
    }
  }, [maestroInicial]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    const res = await fetch("http://localhost:3000/maestro_envios", {
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
      <h3>Ingreso Maestro de Envío</h3>

      <label style={{ marginLeft: "5px" }}>Coordinación:</label>
      <select
        name="id_coordinacion"
        value={formData.id_coordinacion}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione coordinación</option>
        {coordinaciones.map((c) => (
          <option key={c.id} value={c.id}>
            {c.departamento}
          </option>
        ))}
      </select>

      <label style={{ marginLeft: "5px" }}>Correlativo:</label>
      <input type="text" name="correlativo" value={formData.correlativo} readOnly />

      <label style={{ marginLeft: "5px" }}>Tipo de Entrega:</label>
      <select name="tipo_entrega" value={formData.tipo_entrega} onChange={handleChange}>
        <option value="Presencial">Presencial</option>
        <option value="Courier">Courier</option>
      </select>
        
      {formData.tipo_entrega === "Courier" && (
        <>
          <label style={{ marginLeft: "5px" }}>Empresa Courier:</label>
          <select
            name="id_courier"
            value={formData.id_courier}
            onChange={handleCourierChange}
            required
          >
            <option value="">Seleccione courier</option>
            {couriers.map((c) => (
              <option key={c.id_courier} value={c.id_courier}>
                {c.nombre}
              </option>
            ))}
          </select>

          <label style={{ marginLeft: "5px" }}>No. Guía:</label>
          <input
            type="text"
            name="no_guia"
            value={formData.no_guia}
            onChange={handleChange}
          />

        </>
      )}

      <button style={{ marginLeft: "15px" }} type="submit" className="guardar">Grabar</button>
    </form>
  </div>
  );
}

export default MaestroEnvioForm;