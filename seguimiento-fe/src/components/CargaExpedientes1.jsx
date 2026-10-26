import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

const CargaExpedientes = () => {
  const [file, setFile] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const res = await fetch("http://seguimiento-be-production-7e17.up.railway.app/coordinaciones");
        const data = await res.json();
        setDepartamentos(data);
      } catch {
        setMessage("Error cargando departamentos");
      }
    };
    fetchDepartamentos();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file || !selectedDept) {
      setMessage("Seleccione archivo y departamento");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Normalizar encabezados
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const registros = rows.slice(1).map((r) => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = r[i];
        });
        return obj;
      });

      // Filtro por departamento
      const filtrados = registros.filter(
        (row) =>
          (row.departamento || "").trim().toUpperCase() ===
          selectedDept.trim().toUpperCase()
      );

      if (filtrados.length === 0) {
        setMessage("No se encontraron registros para ese departamento");
        setLoading(false);
        return;
      }

      // Validar RUBs en batch
      const rubs = filtrados.map((row) => row.rub);
      console.log("Validando rubs:", rubs);

      let estatusMap = {};
      try {
        const rubRes = await fetch("http://seguimiento-be-production-7e17.up.railway.app/expedientes/rub/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rubs }),
        });
        const rubData = await rubRes.json();
        rubData.forEach((item) => {
          estatusMap[item.rub] = item.estatus;
        });
      } catch (err) {
        console.error("Error en batch RUB:", err);
      }

      // Insertar todos los campos
      for (const row of filtrados) {
        const expediente = {
          id_carga: uuidv4(),
          rub: row.rub,
          estatus: estatusMap[row.rub] || "Nuevo",
          departamento: row.departamento,
          municipio: row["municipio"],
          lugar_poblado: row["lugar poblado"],
          direccion: row["dirección"],
          codigo_familia: row["código familia"],
          codigo_titular: row["código titular"],
          primer_nombre: row["primer nombre"],
          segundo_nombre: row["segundo nombre"],
          tercer_nombre: row["tercer nombre"],
          primer_apellido: row["primer apellido"],
          segundo_apellido: row["segundo apellido"],
          apellido_casada: row["apellido de casada"],
          telefonos: row["telefonos"],
          fecha_nacimiento: row["fecha de nacimiento"],
          genero: row["genero"],
          es_extranjero: (row["es extranjero"] || "").toUpperCase() === "SI",
          estado_conyugal: row["estado conyugal"],
          embarazada: (row["embarazada"] || "").toUpperCase() === "SI",
          beneficio_familia: row["beneficio familia"],
          estatus_hogar: row["estatus hogar"],
          identificacion: row["identificación"],
          fecha_ingreso_padron: row["fecha de ingreso al padrón"],
          posee_carta_ultimoregistro: (row["posee_carta_ultimoregistro"] || "").toUpperCase() === "SI",
          posee_expediente_ultimoregistro: (row["posee_expediente_ultimoregistro"] || "").toUpperCase() === "SI",
          geolocalizacion: row["geolocalizacion"],
          observacion: row["observación 1"],
        };

        console.log("Insertando expediente:", expediente);

        const res = await fetch("http://seguimiento-be-production-7e17.up.railway.app/expedientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expediente),
        });

        const result = await res.json();
        if (result.error) {
          console.error("Error insertando:", result.error);
        }
      }

      setMessage(`Carga completada: ${filtrados.length} registros insertados`);
    } catch {
      setMessage("Error procesando archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Carga de Expedientes</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <select
        value={selectedDept}
        onChange={(e) => setSelectedDept(e.target.value)}
      >
        <option value="">Seleccione departamento</option>
        {departamentos.map((d) => (
          <option key={d.id} value={d.departamento}>
            {d.departamento}
          </option>
        ))}
      </select>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Procesando..." : "Cargar"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CargaExpedientes;