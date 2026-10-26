// src/components/SubprogramasTable.jsx

import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import SubprogramaForm from "./SubprogramaForm";

function SubprogramasTable() {
  const [subprogramas, setSubprogramas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargarSubprogramas = async () => {
    try {
      const res = await fetch("https://seguimiento-be-production-7e17.up.railway.app/subprogramas");
      const data = await res.json();
      setSubprogramas(data);
    } catch (err) {
      console.error("Error cargando subprogramas:", err);
    }
  };

  useEffect(() => {
    cargarSubprogramas();
  }, []);

  const eliminarSubprograma = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este subprograma?")) {
      await fetch(`https://seguimiento-be-production-7e17.up.railway.app/subprogramas/${id}`, { method: "DELETE" });
      setSubprogramas(subprogramas.filter((s) => s.id !== id));
    }
  };

  const editarSubprograma = async (id, valorActual) => {
    const nuevoNombre = prompt("Ingrese el nuevo nombre del subprograma:", valorActual);
    if (nuevoNombre) {
      await fetch(`https://seguimiento-be-production-7e17.up.railway.app/subprogramas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });
      setSubprogramas(
        subprogramas.map((s) =>
          s.id === id ? { ...s, nombre: nuevoNombre } : s
        )
      );
    }
  };

  return (
    <div className="contenedor-principal">
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Listado de Subprogramas
      </h2>
      <button onClick={() => setMostrarForm(true)} className="agregar">
        Agregar Subprograma
      </button>

      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <SubprogramaForm
              onSubprogramaAgregado={() => {
                setMostrarForm(false);
                cargarSubprogramas();
              }}
            />
            <button
              onClick={() => {
                setMostrarForm(false);
                cargarSubprogramas();
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
            <th>Programa</th>
            <th>Nombre</th>
            <th>Encargado</th>
            <th>Piso Entrega</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subprogramas.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.programas?.nombre_programa}</td>
              <td>{s.nombre}</td>
              <td>{s.encargado}</td>
              <td>{s.piso_entrega}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="editar"
                  onClick={() => editarSubprograma(s.id, s.nombre)}
                  style={{ marginRight: "8px" }}
                >
                  <FaEdit style={{ marginRight: "6px" }} /> Editar
                </button>
                <button
                  className="eliminar"
                  onClick={() => eliminarSubprograma(s.id)}
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

export default SubprogramasTable;