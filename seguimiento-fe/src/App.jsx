// src/App.jsx

import React, { useState, useEffect } from "react";
import "./App.css";

import logoMinisterio from "./assets/LogoMiDes.png";
import Login from "./components/Login";
import MenuPrincipal from "./components/MenuPrincipal";
//import MenuLateral from "./components/MenuLateral";
import Dashboard from "./components/Dashboard";
import ProcesosTable from "./components/ProcesosTable";
import CoordinacionesTable from "./components/CoordinacionesTable";
import UsuariosTable from "./components/UsuariosTable";
import RolesTable from "./components/RolesTable";
import ProgramasTable from "./components/ProgramasTable";
import SubprogramasTable from "./components/SubprogramasTable";
import EnviosProceso from "./components/EnviosProceso";
import SeguimientoEnvios from "./components/SeguimientoEnvios";
import CargaExpedientes from "./components/CargaExpedientes"; 
import ExpedientesCoordinacion from "./components/ExpedientesCoordinacion"; 
import ActualizarExpedientes from "./components/ActualizarExpedientes";
import TrasladoExpediente from "./components/TrasladoExpediente";
import RecepcionExpediente from "./components/RecepcionExpediente";
import ExpedientesConsulta from "./components/ExpedientesConsulta";
import ConsultaDocumentos from "./components/ConsultaDocumentos";
import HistorialDocumento from "./components/HistorialDocumento";
import RecepcionDCO from "./components/RecepcionDCO";



function App() {
  const [vista, setVista] = useState("menuPrincipal");
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );

  // ✅ Recuperar vista al iniciar
  useEffect(() => {
    const vistaGuardada = localStorage.getItem("vista");
    if (vistaGuardada) {
      setVista(vistaGuardada);
    }
  }, []);

  // ✅ Guardar vista cada vez que cambie
  useEffect(() => {
    localStorage.setItem("vista", vista);
  }, [vista]);

  // ✅ Guardar usuario en localStorage cuando se loguea
  const handleLoginExitoso = (data) => {
    localStorage.setItem("usuario", JSON.stringify(data));
    setUsuario(data);
    setVista("menuPrincipal");
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setVista("menuPrincipal");
  };

  if (!usuario) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  return (
    <div style={{ display: "flex" }}>
      {/* Drawer lateral
      <MenuLateral setVista={setVista} usuario={usuario} /> */}

      {/* Contenedor principal */}
      <div className="contenedor-principal">
        {/* Encabezado institucional */}
        <header>
          <img
            src={logoMinisterio}
            alt="Logo Ministerio de Desarrollo Social"
            style={{ width: "220px", height: "auto" }}
          />

          <div style={{ textAlign: "center", flex: 1 }}>
            <h1
              style={{
                fontSize: "2.5rem",
                color: "#4997D0",
                margin: 0,
              }}
            >
              Sistema de Seguimiento
            </h1>
          </div>

          <button onClick={handleLogout} className="boton-volver">
            🚪 Cerrar Sesión
          </button>
        </header>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          {vista !== "menuPrincipal" && (
            <button
              onClick={() => setVista("menuPrincipal")}
              style={{ marginTop: "10px", display: "block" }}
              className="boton-volver"
            >
              ⬅️ Volver al Menú
            </button>
          )}
        </div>

        {/* Contenido principal según vista */}
        {vista === "menuPrincipal" && (
          <MenuPrincipal setVista={setVista} usuario={usuario} />
        )}
        {vista === "dashboard" && <Dashboard />}
        {vista === "procesos" && <ProcesosTable />}
        {vista === "coordinaciones" && <CoordinacionesTable />}
        {vista === "usuarios" && <UsuariosTable />}
        {vista === "roles" && <RolesTable />}
        {vista === "programas" && <ProgramasTable />}
        {vista === "subprogramas" && <SubprogramasTable />}
        {vista === "envios" && <EnviosProceso />}
        {vista === "seguimiento" && <SeguimientoEnvios />}
        {vista === "cargaExpedientes" && <CargaExpedientes />} 
        {vista === "expedientesCoordinacion" && <ExpedientesCoordinacion />} 
        {vista === "actualizarExpedientes" && <ActualizarExpedientes />}        
        {vista === "trasladoExpediente" && <TrasladoExpediente usuario={usuario} />}
        {vista === "recepcionExpediente" && <RecepcionExpediente />}        
        {vista === "expedientesConsulta" && <ExpedientesConsulta />}
        {vista === "consultaDocumentos" && <ConsultaDocumentos />}
        {vista === "historialDocumento" && <HistorialDocumento />}
        {vista === "recepcionDCO" && <RecepcionDCO />}
      </div>
    </div>
  );
}

export default App;