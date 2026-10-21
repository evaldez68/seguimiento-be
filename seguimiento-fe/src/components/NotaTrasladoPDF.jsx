// src/components/NotaTrasladoPDF.jsx
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/LogoMides.png";
const fechaFormateada = new Date().toLocaleDateString("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

// Capitalizar el mes
const fechaCapitalizada = fechaFormateada.replace(/\b\w/g, c => c.toUpperCase());


export const generarNotaTraslado = (maestro, detalle) => {
  const doc = new jsPDF();
  doc.setLineHeightFactor(1.0); // valor por defecto es 1.15, puedes bajarlo a 1.0 o 0.9

  // Logo institucional
  doc.addImage(logo, "PNG", 10, 10, 60, 20);
  //doc.setFontSize(14);
  //doc.text("Ministerio de Desarrollo Social", 80, 20);

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NOTA DE TRASLADO", 105, 50, { align: "center" });
  doc.setFont("helvetica", "normal");

  // Número de nota
  const correlativo = maestro.correlativo?.toString().padStart(5, "0") || "00000";
  const iniciales = maestro.iniciales || prompt("Ingrese las iniciales para la nota de traslado:");
  const numeroNota = `${maestro.coordinaciones_departamentales?.departamento || "Departamento"}-${correlativo}-${new Date().getFullYear()}/${iniciales}`;
  doc.setFontSize(12);
  doc.text(numeroNota, 105, 55, { align: "center" });

  // Datos principales
  doc.setFontSize(11);
  doc.text(`De: ${maestro.coordinaciones_departamentales?.coordinador || "Sin Coordinador"}`, 20, 70);
  doc.text(`Coordinadora Departamental de ${maestro.coordinaciones_departamentales?.departamento || "Sin Departamento"}`, 20, 75);
  doc.text("Dirección de Coordinación y Organización", 20, 80);

  doc.text("Para: Subdirección Técnica", 20, 95);
  doc.text("Dirección de Coordinación y Organización", 20, 100);
  doc.text("Viceministerio de Protección Social", 20, 105);

  doc.text("C.c.: Archivo", 20, 110);

  doc.text("Asunto:      -- TRASLADO DE DOCUMENTACIÓN --", 20, 125);
  doc.text(`Fecha: Guatemala, ${fechaCapitalizada}`, 20, 130, { align: "left" });
  
  doc.text("Atentamente me dirijo a ustedes, con el objeto de trasladar la documentación siguiente:", 20, 145);

 // Tabla con bordes usando autoTable
  autoTable(doc, {
  startY: 155,
  head: [["No.", "No. de Docto.", "Programa / Subprograma"]],
  body: detalle.map((d, i) => [
    String(i + 1).padStart(2, "0"),
    d.numero_documento || "",
    `${d.programa || " "}/${d.subprograma || ""}`
  ]),
  styles: { fontSize: 10, halign: "left", lineWidth: 0.2, cellPadding: 1}, 
  headStyles: { fillColor: [200, 200, 200], lineWidth: 0.5 }, // 👈 bordes más marcados en encabezado
  tableLineWidth: 0.3, // 👈 asegura bordes en toda la tabla
  tableLineColor: [0, 0, 0] // 👈 color para los bordes
});
  // 👇 Línea de firma 10px abajo del final de la tabla
  const finalY = doc.lastAutoTable.finalY || 230;
  doc.text("Recibido f./Sello ________________________", 20, finalY + 25);

  // Descargar
  doc.save(`NotaTraslado_${numeroNota}.pdf`);
};