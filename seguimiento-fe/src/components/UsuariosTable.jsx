// src/components/UsuariosTable.jsx
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ExportExcel from "./ExportExcel";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import UsuarioForm from "./UsuarioForm";

function UsuariosTable() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Nombre", key: "nombre" },
    { header: "Correo", key: "correo" },
    { header: "Rol", key: "rol_id" },
    { header: "Activo", key: "activo" },
    { header: "Fecha Registro", key: "fecha_registro" },
  ];

  const cargarUsuarios = () => {
    fetch("http://seguimiento-be-production-7e17.up.railway.app/usuarios_seguimiento")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const eliminarUsuario = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      await fetch(`http://seguimiento-be-production-7e17.up.railway.app/usuarios_seguimiento/${id}`, { method: "DELETE" });
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  const editarUsuario = async (id, campo, valorActual) => {
    const nuevoValor = prompt(`Ingrese el nuevo ${campo}:`, valorActual);
    if (nuevoValor) {
      await fetch(`http://seguimiento-be-production-7e17.up.railway.app/usuarios_seguimiento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: nuevoValor }),
      });
      setUsuarios(
        usuarios.map((u) =>
          u.id === id ? { ...u, [campo]: nuevoValor } : u
        )
      );
    }
  };

  const exportPDF = () => {
    const input = document.getElementById("tabla-usuarios");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("usuarios.pdf");
    });
  };

  return (
    <div className="contenedor-principal">
      {/* Botones de exportación */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", marginTop: "15px" }}>
        <ExportExcel
          data={usuarios}
          columns={columns}
          fileName="usuarios"
        />
        <button onClick={exportPDF} className="boton-exportar">
          Exportar PDF
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Listado de Usuarios
      </h2>
      <button onClick={() => setMostrarForm(true)} className="agregar">
        Agregar Usuario
      </button>

      {/* Modal con UsuarioForm */}
      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UsuarioForm
              onUsuarioAgregado={() => {
                setMostrarForm(false);
                cargarUsuarios();
              }}
            />
            <button
              onClick={() => {
                setMostrarForm(false);
                cargarUsuarios();
              }}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <table id="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.roles_seguimiento?.nombre || "Sin rol"}</td>
              <td>{u.activo ? "Sí" : "No"}</td>
              <td>{u.fecha_registro}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="editar"
                  onClick={() => editarUsuario(u.id, "nombre", u.nombre)}
                  style={{ marginRight: "8px" }}
                >
                  <FaEdit style={{ marginRight: "6px" }} /> Editar
                </button>
                <button
                  className="eliminar"
                  onClick={() => eliminarUsuario(u.id)}
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

export default UsuariosTable;