// src/components/EnviosProceso.jsx
import React, { useState } from "react";
import MaestroEnvioForm from "./MaestroEnvioForm";
import DetalleEnvioGrid from "./DetalleEnvioGrid";
import { generarNotaTraslado } from "./NotaTrasladoPDF";

function EnviosProceso() {
  const [idMaestro, setIdMaestro] = useState(null);
  const [maestro, setMaestro] = useState({});
  const [detalle, setDetalle] = useState([]);
  const [buscarCorrelativo, setBuscarCorrelativo] = useState("");

  const handleGrabarMaestro = (data) => {
    if (data && data.id) {
      setMaestro(data);
      setIdMaestro(data.id);
    }
  };

  const handleNuevaNota = async () => {
    setIdMaestro(null);
    setDetalle([]);

    const res = await fetch("http://localhost:3000/maestro_envios/ultimo-correlativo");
    const info = await res.json();

    setMaestro({
      id_coordinacion: "",
      correlativo: info.siguiente,
      tipo_entrega: "Presencial",
      no_guia: "",
      empresa_courier: "",
    });
  };

  const handleBuscarNota = async () => {
    if (!buscarCorrelativo.trim()) {
      alert("Debe ingresar el correlativo a buscar");
      return;
    }

    const resMaestro = await fetch(
      `http://localhost:3000/maestro_envios/${buscarCorrelativo}`
    );
    const maestroData = await resMaestro.json();

    if (!maestroData || !maestroData.id) {
      alert("No se encontró nota con ese correlativo");
      return;
    }

    setMaestro(maestroData);
    setIdMaestro(maestroData.id);

    const resDetalle = await fetch("http://localhost:3000/detalle_envios");
    const detalleData = await resDetalle.json();
    const filtrados = detalleData.filter(
      (d) => d.id_maestro_envio === maestroData.id
    );
    setDetalle(filtrados);

    setBuscarCorrelativo("");
  };

  return (
    <div className="contenedor-envios">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Ingreso de Envíos
      </h2>

      {/* 🔎 Buscar arriba del formulario */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar correlativo"
          value={buscarCorrelativo}
          onChange={(e) => setBuscarCorrelativo(e.target.value)}
        />
        <button onClick={handleBuscarNota} className="btn-accion">Buscar</button>
      </div>

      <MaestroEnvioForm onGrabar={handleGrabarMaestro} maestroInicial={maestro} />

      {idMaestro && (
        <>
          <DetalleEnvioGrid idMaestro={idMaestro} onChange={setDetalle} />
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => generarNotaTraslado(maestro, detalle)}
              className="btn-pdf"
            >
              Generar Nota de Traslado
            </button>
          </div>
          {/* 🔎 Nueva Nota solo aparece después de grabar */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={handleNuevaNota} className="btn-accion">Nueva Nota</button>
          </div>
        </>
      )}
    </div>
  );
}

export default EnviosProceso;