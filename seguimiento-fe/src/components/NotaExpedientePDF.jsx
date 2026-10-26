// src/components/NotaExpedientePDF.jsx
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/LogoMiDes.png";

const fechaFormateada = new Date().toLocaleDateString("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});
const fechaCapitalizada = fechaFormateada.replace(/\b\w/g, c => c.toUpperCase());

export const generarNotaExpediente = (departamento, correlativo, detalle) => {
  const doc = new jsPDF();
  doc.setLineHeightFactor(1.0);

  // Logo institucional
  doc.addImage(logo, "PNG", 10, 10, 60, 20);

  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NOTA DE TRASLADO", 105, 50, { align: "center" });
  doc.setFont("helvetica", "normal");

  // Número de nota
  const numeroNota = `${departamento}-${correlativo.padStart(4, "0")}-${new Date().getFullYear()}`;
  doc.setFontSize(12);
  doc.text(numeroNota, 105, 55, { align: "center" });

  // Datos principales
  doc.setFontSize(11);
  doc.text(`De: Coordinador Departamental de ${departamento}`, 20, 70);
  doc.text("Dirección de Coordinación y Organización", 20, 75);

  doc.text("Para: Subdirección Técnica", 20, 95);
  doc.text("Dirección de Coordinación y Organización", 20, 100);
  doc.text("Viceministerio de Protección Social", 20, 105);

  doc.text("C.c.: Archivo", 20, 115);

  doc.text("Asunto:      -- TRASLADO DE DOCUMENTACIÓN --", 20, 130);
  doc.text(`Fecha: Guatemala, ${fechaCapitalizada}`, 20, 135);

  doc.text("Atentamente me dirijo a ustedes, con el objeto de trasladar los siguientes expedientes:", 20, 150);

  // Tabla con registros seleccionados
  autoTable(doc, {
    startY: 160,
    head: [["No.", "RUB", "Nombre", "Departamento", "Municipio"]],
    body: detalle.map((d, i) => [
      String(i + 1).padStart(2, "0"),
      d.rub || "",
      d.nombre || "",
      d.departamento || "",
      d.municipio || ""
    ]),
    styles: { fontSize: 10, halign: "left", lineWidth: 0.2, cellPadding: 1 },
    headStyles: { fillColor: [200, 200, 200], lineWidth: 0.5 },
    tableLineWidth: 0.3,
    tableLineColor: [0, 0, 0]
  });

  const finalY = doc.lastAutoTable.finalY || 230;
  doc.text("Recibido f./Sello ________________________", 20, finalY + 25);

  // Descargar
  doc.save(`NotaTraslado_${numeroNota}.pdf`);
};