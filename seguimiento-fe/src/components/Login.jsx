import React, { useState } from "react";
import logoMinisterio from "../assets/LogoMiDes.png";

function Login({ onLoginExitoso }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/usuarios_seguimiento/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Guardar usuario con rol en estado y localStorage
        const usuario = {
          id: data.id,
          nombre: data.nombre,
          correo: data.correo,
          rol: data.roles_seguimiento?.nombre,        // 👈 nombre del rol
          rolDescripcion: data.roles_seguimiento?.descripcion, // 👈 descripción del rol
        };

        onLoginExitoso(usuario);
        localStorage.setItem("usuario", JSON.stringify(usuario));
      } else {
        setError(data.error || "Usuario / Contraseña no válido");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Encabezado institucional */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        <img
          src={logoMinisterio}
          alt="Logo Ministerio de Desarrollo Social"
          style={{ width: "180px", height: "auto" }}
        />
        <h1
          style={{
            fontSize: "1.8rem",
            color: "#003366",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
          Sistema de Seguimiento
        </h1>
      </div>

      {/* Card azul centrado */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#003366",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            width: "400px",
            textAlign: "center",
            color: "white",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "white" }}>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label style={{ fontWeight: "bold" }}>Correo:</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  marginTop: "5px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label style={{ fontWeight: "bold" }}>Contraseña:</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  marginTop: "5px",
                }}
              />
            </div>
            {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
            <button
              type="submit"
              style={{
                backgroundColor: "white",
                color: "#003366",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                width: "100%",
                marginTop: "10px",
              }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;