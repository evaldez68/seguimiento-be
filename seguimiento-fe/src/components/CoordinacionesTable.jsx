// src/components/CoordinacionesTable.jsx
import React, { useEffect, useState } from "react";
import CoordinacionForm from "./CoordinacionForm";
import ExportExcel from "./ExportExcel";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FaEdit, FaTrash } from "react-icons/fa";

function CoordinacionesTable() {
  const [coordinaciones, setCoordinaciones] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Departamento", key: "departamento" },
    { header: "Coordinador", key: "coordinador" },
    { header: "Dirección Física", key: "direccion_fisica" },
    { header: "Contacto", key: "contacto" },
  ];

  const cargarCoordinaciones = () => {
    fetch("http://localhost:3000/coordinaciones")
      .then((res) => res.json())
      .then((data) => setCoordinaciones(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarCoordinaciones();
  }, []);

  const eliminarCoordinacion = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta coordinación?")) {
      await fetch(`http://localhost:3000/coordinaciones/${id}`, { method: "DELETE" });
      setCoordinaciones(coordinaciones.filter((c) => c.id !== id));
    }
  };

  const editarCoordinacion = async (id, campo, valorActual) => {
    const nuevoValor = prompt(`Ingrese el nuevo ${campo}:`, valorActual);
    if (nuevoValor) {
      await fetch(`http://localhost:3000/coordinaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: nuevoValor }),
      });
      setCoordinaciones(
        coordinaciones.map((c) =>
          c.id === id ? { ...c, [campo]: nuevoValor } : c
        )
      );
    }
  };

  const exportPDF = () => {
    const input = document.getElementById("tabla-coordinaciones");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("coordinaciones.pdf");
    });
  };

  return (
    <div className="contenedor-principal">
      {/* Botones de exportación */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", marginTop: "15px" }}>
        <ExportExcel
          data={coordinaciones}
          columns={columns}
          fileName="coordinaciones"
        />
        <button onClick={exportPDF} className="boton-exportar">
          Exportar PDF
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Listado de Coordinaciones
      </h2>
      <button onClick={() => setMostrarForm(true)} className="agregar">
        Agregar Coordinación
      </button>

      {/* Modal con CoordinacionForm */}
      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CoordinacionForm
              onCoordinacionAgregada={() => {
                setMostrarForm(false);
                cargarCoordinaciones();
              }}
            />
            <button
              onClick={() => {
                setMostrarForm(false);
                cargarCoordinaciones();
              }}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <table id="tabla-coordinaciones">
        <thead>
          <tr>
            <th>ID</th>
            <th>Departamento</th>
            <th>Coordinador</th>
            <th>Dirección Física</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coordinaciones.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.departamento}</td>
              <td>{c.coordinador}</td>
              <td>{c.direccion_fisica}</td>
              <td>{c.contacto}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="editar"
                  onClick={() => editarCoordinacion(c.id, "departamento", c.departamento)}
                  style={{ marginRight: "8px" }}
                >
                  <FaEdit style={{ marginRight: "6px" }} /> Editar
                </button>
                <button
                  className="eliminar"
                  onClick={() => eliminarCoordinacion(c.id)}
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

export default CoordinacionesTable;