// src/components/MenuPrincipal.jsx
import React from "react";
import "./MenuPrincipal.css"; // 👈 archivo CSS para estilos

function MenuPrincipal({ setVista, usuario }) {
  return (
    <div className="contenedor-principal">
      <h2 className="titulo-menu">Menú Principal</h2>

      {/* Sección Ingreso Maestros */}
      <h3>Ingreso Maestros</h3>
      <div className="menu-grid">
        <div className="menu-card" onClick={() => setVista("procesos")}>Procesos</div>
        <div className="menu-card" onClick={() => setVista("coordinaciones")}>Coordinaciones</div>
        {usuario?.rol === "Administrador" && (
          <>
            <div className="menu-card" onClick={() => setVista("usuarios")}>Usuarios</div>
            <div className="menu-card" onClick={() => setVista("roles")}>Roles</div>
          </>
        )}
        <div className="menu-card" onClick={() => setVista("programas")}>Programas</div>
        <div className="menu-card" onClick={() => setVista("subprogramas")}>Subprogramas</div>
      </div>

      {/* Sección Seguimiento Documentos */}
      <h3>Seguimiento Documentos</h3>
      <div className="menu-grid">
        <div className="menu-card" onClick={() => setVista("envios")}>Ingreso de Envíos</div>
        <div className="menu-card" onClick={() => setVista("recepcionDCO")}>Recepción DCO</div>
        <div className="menu-card" onClick={() => setVista("seguimiento")}>Seguimiento de Envíos</div>
        <div className="menu-card" onClick={() => setVista("consultaDocumentos")}>Consulta de Documentos</div>
        <div className="menu-card" onClick={() => setVista("historialDocumento")}>Historial de Documento</div>
      </div>

      {/* Sección Seguimiento Expedientes */}
      <h3>Seguimiento Expedientes</h3>
      <div className="menu-grid">
        <div className="menu-card" onClick={() => setVista("cargaExpedientes")}>Carga de Expedientes</div>
        <div className="menu-card" onClick={() => setVista("expedientesCoordinacion")}>Expedientes Coordinación</div>
        <div className="menu-card" onClick={() => setVista("actualizarExpedientes")}>Actualizar Expedientes</div>
      </div>
      <div className="menu-grid">
        <div className="menu-card" onClick={() => setVista("trasladoExpediente")}>Traslado de Expedientes</div>
        <div className="menu-card" onClick={() => setVista("recepcionExpediente")}>Recepción de Expedientes</div>
        <div className="menu-card" onClick={() => setVista("expedientesConsulta")}>Consulta de Expedientes</div>
      </div>

      {/* Sección Dashboard */}
      <h3>Dashboard</h3>
      <div className="menu-grid">
        <div className="menu-card" onClick={() => setVista("dashboard")}>Dashboard</div>
      </div>
    </div>
  );
}

export default MenuPrincipal;