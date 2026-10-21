// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
);

function Dashboard() {
  const [resumenCargas, setResumenCargas] = useState([]);
  const [expedientesDepto, setExpedientesDepto] = useState([]);
  const [expedientesEstatus, setExpedientesEstatus] = useState([]);
  const [idCargaSeleccionada, setIdCargaSeleccionada] = useState(null);

  useEffect(() => {
    // carga inicial: resumen de cargas
    fetch("http://localhost:3000/expedientes/resumen")
      .then(res => res.json())
      .then(data => setResumenCargas(data));
    // carga inicial: todos los departamentos
    fetch("http://localhost:3000/expedientes/deptos")
      .then(res => res.json())
      .then(data => setExpedientesDepto(data));

    // carga inicial: todos los estatus
    fetch("http://localhost:3000/expedientes/estatus")
      .then(res => res.json())
      .then(data => setExpedientesEstatus(data));      
  }, []);

  const dataCargas = {
    labels: resumenCargas.map(c => `Carga ${c.id_carga} (${c.fecha_carga})`),
    datasets: [
      {
        label: "Total expedientes por carga",
        data: resumenCargas.map(c => c.total_expedientes),
        backgroundColor: "#2ECC71",
      },
    ],
  };

  const optionsCargas = {
    onClick: async (evt, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const carga = resumenCargas[index].id_carga;
      setIdCargaSeleccionada(carga);

      // fetch departamentos por carga
      const resDepto = await fetch(`http://localhost:3000/expedientes/deptos/${carga}`);
      const dataDepto = await resDepto.json();
      setExpedientesDepto(dataDepto);

      // fetch estatus por carga
      const resEstatus = await fetch(`http://localhost:3000/expedientes/estatus/${carga}`);
      const dataEstatus = await resEstatus.json();
      setExpedientesEstatus(dataEstatus);
    },
  };

  const dataDepto = {
    labels: expedientesDepto.map(d => d.departamento),
    datasets: [
      {
        label: "Expedientes por departamento",
        data: expedientesDepto.map(d => d.total),
        backgroundColor: "#3498DB",
      },
    ],
  };

  const optionsDepto = {
    onClick: async (evt, elements) => {
      if (!elements.length || !idCargaSeleccionada) return;
      const index = elements[0].index;
      const depto = dataDepto.labels[index];

      // fetch dinámico de estatus por departamento y carga
      const res = await fetch(`http://localhost:3000/expedientes/estatus_depto/${idCargaSeleccionada}/${depto}`);
      const data = await res.json();
      setExpedientesEstatus(data);
    },
  };

  const dataEstatus = {
    labels: expedientesEstatus.map(e => e.estatus),
    datasets: [
      {
        label: "Expedientes por estatus",
        data: expedientesEstatus.map(e => e.total),
        backgroundColor: ["#27AE60", "#C0392B", "#2980B9", "#F39C12", "#8E44AD"],
      },
    ],
  };

  const optionsEstatus = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const porcentaje = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${porcentaje}%)`;
          },
        },
      },
      legend: {
        position: "right",
        labels: {
          generateLabels: function (chart) {
            const data = chart.data;
            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i];
              const porcentaje = ((value / total) * 100).toFixed(1);
              return {
                text: `${label} (${porcentaje}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                index: i,
              };
            });
          },
        },
      },
    },
  };

  return (
    <div className="contenedor-principal">
      <h2 style={{ textAlign: "center", marginBottom: "20px", marginTop: "30px", color: "var(--guatemala-blue)" }}>
        Dashboard Interactivo
      </h2>

      <div style={{ width: "80%", margin: "auto", marginBottom: "40px", marginTop: "20px" }}>
        <h3>Cargas realizadas</h3>
        <Bar data={dataCargas} options={optionsCargas} />
      </div>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ width: "80%", margin: "auto", marginBottom: "40px" }}>
          <h3>Expedientes por Departamento</h3>
          <Bar data={dataDepto} options={optionsDepto} />
        </div>

        <div style={{ width: "60%", margin: "auto", marginBottom: "40px" }}>
          <h3>Expedientes por Estatus</h3>
          <Pie data={dataEstatus} options={optionsEstatus} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;