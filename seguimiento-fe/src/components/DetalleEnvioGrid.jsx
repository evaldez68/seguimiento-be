// src/components/DetalleEnvioGrid.jsx
import React, { useState, useEffect } from "react";

function DetalleEnvioGrid({ idMaestro, onChange }) {
  const [detalle, setDetalle] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [subprogramas, setSubprogramas] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo_documento: "",
    numero_documento: "",
    programa: "",
    subprograma: "",
  });

  useEffect(() => {
    fetch("https://seguimiento-be-production-7e17.up.railway.app/programas")
      .then((res) => res.json())
      .then((data) => setProgramas(data));

    fetch("https://seguimiento-be-production-7e17.up.railway.app/subprogramas")
      .then((res) => res.json())
      .then((data) => setSubprogramas(data));

    if (idMaestro) {
      cargarDetalle();
    }
  }, [idMaestro]);

  const cargarDetalle = async () => {
    const res = await fetch("https://seguimiento-be-production-7e17.up.railway.app/detalle_envios");
    const data = await res.json();
    const filtrados = data.filter((d) => d.id_maestro_envio === idMaestro);
    setDetalle(filtrados);
    if (onChange) onChange(filtrados);
  };

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const agregarDetalle = async () => {
    // ✅ Validación: todos los campos deben tener valor
    if (
      !nuevo.tipo_documento.trim() ||
      !nuevo.numero_documento.trim() ||
      !nuevo.programa.trim() ||
      !nuevo.subprograma.trim()
    ) {
      alert("Debe completar todos los campos antes de grabar el detalle.");
      return;
    }

    const payload = { ...nuevo, id_maestro_envio: idMaestro };
    await fetch("https://seguimiento-be-production-7e17.up.railway.app/detalle_envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await cargarDetalle();
    setNuevo({ tipo_documento: "", numero_documento: "", programa: "", subprograma: "" });
  };

  return (
    <div>
      <h3>Detalle de Documentos</h3>
      <table>
        <thead>
          <tr>
            <th>Tipo Documento</th>
            <th>Número Documento</th>
            <th>Programa</th>
            <th>Subprograma</th>
          </tr>
        </thead>
        <tbody>
          {detalle.map((d, i) => (
            <tr key={i}>
              <td>{d.tipo_documento}</td>
              <td>{d.numero_documento}</td>
              <td>{d.programa}</td>
              <td>{d.subprograma}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="formulario-detalle">
        <input
          type="text"
          name="tipo_documento"
          placeholder="Tipo Documento"
          value={nuevo.tipo_documento}
          onChange={handleChange}
        />
        <input
          type="text"
          name="numero_documento"
          placeholder="Número Documento"
          value={nuevo.numero_documento}
          onChange={handleChange}
        />
        <select name="programa" value={nuevo.programa} onChange={handleChange}>
          <option value="">Seleccione Programa</option>
          {programas.map((p) => (
            <option key={p.id} value={p.nombre_programa}>
              {p.nombre_programa}
            </option>
          ))}
        </select>
        <select name="subprograma" value={nuevo.subprograma} onChange={handleChange}>
          <option value="">Seleccione Subprograma</option>
          {subprogramas.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </select>
        <button onClick={agregarDetalle}>Agregar</button>
      </div>
    </div>
  );
}

export default DetalleEnvioGrid;