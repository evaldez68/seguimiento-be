// src/components/ProcesosTable.jsx

import React, { useEffect, useState } from "react";
import ProcesoForm from "./ProcesoForm";
import ExportExcel from "./ExportExcel";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FaEdit, FaTrash } from "react-icons/fa";

function ProcesosTable() {
  const [procesos, setProcesos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Nombre Proceso", key: "nombre_proceso" },
    { header: "Encargado", key: "encargado" },
  ];

  const cargarProcesos = () => {
    fetch("http://seguimiento-be-production-7e17.up.railway.app/procesos")
      .then((res) => res.json())
      .then((data) => setProcesos(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarProcesos();
  }, []);

  const eliminarProceso = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este proceso?")) {
      await fetch(`http://seguimiento-be-production-7e17.up.railway.app/procesos/${id}`, { method: "DELETE" });
      setProcesos(procesos.filter((p) => p.id !== id));
    }
  };

  const editarProceso = async (id, nombreActual) => {
    const nuevoNombre = prompt("Ingrese el nuevo nombre:", nombreActual);
    if (nuevoNombre) {
      await fetch(`http://seguimiento-be-production-7e17.up.railway.app/procesos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_proceso: nuevoNombre }),
      });
      setProcesos(
        procesos.map((p) =>
          p.id === id ? { ...p, nombre_proceso: nuevoNombre } : p
        )
      );
    }
  };

  const exportPDF = () => {
    const input = document.getElementById("tabla-procesos");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("procesos.pdf");
    });
  };

  return (
    <div className="contenedor-principal">
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", marginTop: "15px" }}>
        <ExportExcel data={procesos} columns={columns} fileName="procesos" />
        <button onClick={exportPDF} className="boton-exportar">
          Exportar PDF
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Listado de Procesos
      </h2>
      <button onClick={() => setMostrarForm(true)} className="agregar">
        Agregar Proceso
      </button>

      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProcesoForm
              onProcesoAgregado={() => {
                setMostrarForm(false);
                cargarProcesos();
              }}
            />
            <button
              onClick={() => {
                setMostrarForm(false);
                cargarProcesos();
              }}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <table id="tabla-procesos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Proceso</th>
            <th>Encargado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {procesos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre_proceso}</td>
              <td>{p.encargado}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="editar"
                  onClick={() => editarProceso(p.id, p.nombre_proceso)}
                  style={{ marginRight: "8px" }}
                >
                  <FaEdit style={{ marginRight: "6px" }} /> Editar
                </button>
                <button
                  className="eliminar"
                  onClick={() => eliminarProceso(p.id)}
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

export default ProcesosTable;