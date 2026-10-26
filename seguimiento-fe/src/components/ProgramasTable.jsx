// src/components/ProgramasTable.jsx

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ProgramasForm from "./ProgramaForm";

function ProgramasTable() {
  const [programas, setProgramas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargarProgramas = async () => {
    try {
      const res = await fetch("http://seguimiento-be-production-7e17.up.railway.app/programas");
      const data = await res.json();
      setProgramas(data);
    } catch (err) {
      console.error("Error cargando programas:", err);
    }
  };

  useEffect(() => {
    cargarProgramas();
  }, []);

  const eliminarPrograma = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este programa?")) {
      await fetch(`http://seguimiento-be-production-7e17.up.railway.app/programas/${id}`, { method: "DELETE" });
      setProgramas(programas.filter((p) => p.id !== id));
    }
  };

  const editarPrograma = async (id, valorActual) => {
    const nuevoNombre = prompt("Ingrese el nuevo nombre del programa:", valorActual);
    if (nuevoNombre) {
      await fetch(`http://seguimiento-be-production-7e17.up.railway.app/programas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_programa: nuevoNombre }),
      });
      setProgramas(
        programas.map((p) =>
          p.id === id ? { ...p, nombre_programa: nuevoNombre } : p
        )
      );
    }
  };

  return (
    <div className="contenedor-principal">
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Listado de Programas
      </h2>
      <button onClick={() => setMostrarForm(true)} className="agregar">
        Agregar Programa
      </button>

      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProgramasForm
              onProgramaAgregado={() => {
                setMostrarForm(false);
                cargarProgramas();
              }}
            />
            <button
              onClick={() => {
                setMostrarForm(false);
                cargarProgramas();
              }}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Programa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {programas.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre_programa}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="editar"
                  onClick={() => editarPrograma(p.id, p.nombre_programa)}
                  style={{ marginRight: "8px" }}
                >
                  <FaEdit style={{ marginRight: "6px" }} /> Editar
                </button>
                <button
                  className="eliminar"
                  onClick={() => eliminarPrograma(p.id)}
                >
                  <FaTrash style={{ marginRight: "6px" }} /> Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProgramasTable;