// src/components/RolesTable.jsx

import React, { useEffect, useState } from "react";
import RolForm from "./RolForm";
import ExportExcel from "./ExportExcel";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FaEdit, FaTrash } from "react-icons/fa";

function RolesTable() {
  const [roles, setRoles] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Nombre del Rol", key: "nombre" },
    { header: "Descripción", key: "descripcion" },
  ];

  const cargarRoles = () => {
    fetch("http://localhost:3000/roles_seguimiento")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const eliminarRol = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este rol?")) {
      await fetch(`http://localhost:3000/roles_seguimiento/${id}`, { method: "DELETE" });
      setRoles(roles.filter((r) => r.id !== id));
    }
  };

  const editarRol = async (id, nombreActual) => {
    const nuevoNombre = prompt("Ingrese el nuevo nombre:", nombreActual);
    if (nuevoNombre) {
      await fetch(`http://localhost:3000/roles_seguimiento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });
      setRoles(
        roles.map((r) =>
          r.id === id ? { ...r, nombre: nuevoNombre } : r
        )
      );
    }
  };

  const exportPDF = () => {
    const input = document.getElementById("tabla-roles");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("roles.pdf");
    });
  };

  return (
    <div className="contenedor-principal">
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <ExportExcel data={roles} columns={columns} fileName="roles" />
        <button onClick={exportPDF} className="boton-exportar">
          Exportar PDF
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Listado de Roles
      </h2>
      <button onClick={() => setMostrarForm(true)} className="agregar">
        Agregar Rol
      </button>

      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <RolForm
              onRolAgregado={() => {
                setMostrarForm(false);
                cargarRoles();
              }}
            />
            <button
              onClick={() => {
                setMostrarForm(false);
                cargarRoles();
              }}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <table id="tabla-roles">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Rol</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nombre}</td>
              <td>{r.descripcion}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="editar"
                  onClick={() => editarRol(r.id, r.nombre)}
                  style={{ marginRight: "8px" }}
                >
                  <FaEdit style={{ marginRight: "6px" }} /> Editar
                </button>
                <button
                  className="eliminar"
                  onClick={() => eliminarRol(r.id)}
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

export default RolesTable;