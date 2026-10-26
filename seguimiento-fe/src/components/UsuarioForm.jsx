// src/components/UsuarioForm.jsx
import React, { useState, useEffect } from "react";

function UsuarioForm({ onUsuarioAgregado }) {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol_id: "",
    activo: true,
  });

  const [roles, setRoles] = useState([]);

  // Cargar roles desde el backend
  useEffect(() => {
    fetch("https://seguimiento-be-production-7e17.up.railway.app/roles_seguimiento")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error cargando roles:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aquí sí grabamos en la tabla usuarios_seguimiento
      const response = await fetch("https://seguimiento-be-production-7e17.up.railway.app/usuarios_seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el usuario");
      }

      onUsuarioAgregado(); // refresca la tabla
    } catch (err) {
      console.error(err);
      alert("Error al guardar el usuario");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h3>Agregar Usuario</h3>

      <label>Nombre:</label>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

      <label>Correo:</label>
      <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />

      <label>Contraseña:</label>
      <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />

      <label>Rol:</label>
      <select name="rol_id" value={formData.rol_id} onChange={handleChange} required>
        <option value="">Seleccione un rol</option>
        {roles.map((rol) => (
          <option key={rol.id} value={rol.id}>
            {rol.nombre}
          </option>
        ))}
      </select>

      <label>
        Activo:
        <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
      </label>

      <button type="submit" className="guardar">Guardar</button>
    </form>
  );
}

export default UsuarioForm;