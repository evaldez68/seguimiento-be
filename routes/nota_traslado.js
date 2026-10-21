import express from "express";
import PDFDocument from "pdfkit";
import path from "path";

const router = express.Router();

router.get("/nota-traslado/:idMaestro", async (req, res) => {
  const { idMaestro } = req.params;

  // Aquí deberías traer los datos reales de maestro y detalle desde Supabase
  const maestro = {
    coordinador: "Juan Manuel Contreras Pineda",
    departamento: "Asistencia Social",
    correlativo: 12,
    iniciales: "JMC",
  };

  const detalle = [
    { numero_documento: "DAS-STMC-E-scd-1652-2026", programa: "Inclusiones", subprograma: "CD" },
    { numero_documento: "DAS-STMC-E-scd-1651-2026", programa: "Inclusiones", subprograma: "CD" },
    { numero_documento: "DAS-STMC-E-scd-1653-2026", programa: "Inclusiones", subprograma: "CD" },
  ];

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=NotaTraslado_${idMaestro}.pdf`);
  doc.pipe(res);

  // Logo institucional
  doc.image(path.resolve("src/assets/LogoMides.png"), 50, 40, { width: 80 });
  doc.fontSize(14).text("Ministerio de Desarrollo Social", 150, 50);
  doc.fontSize(16).text("NOTA DE TRASLADO", { align: "center" });
  doc.moveDown();

  // Número de nota
  const correlativo = maestro.correlativo.toString().padStart(5, "0");
  const numeroNota = `${maestro.departamento}-${correlativo}-${new Date().getFullYear()}/${maestro.iniciales}`;
  doc.fontSize(12).text(numeroNota, { align: "center" });
  doc.moveDown();

  // Datos principales
  doc.text(`De: ${maestro.coordinador}`);
  doc.text(`Coordinadora Departamental de ${maestro.departamento}`);
  doc.text("Dirección de Coordinación y Organización");
  doc.moveDown();

  doc.text("Para: Subdirección Técnica");
  doc.text("Dirección de Coordinación y Organización");
  doc.text("Viceministerio de Protección Social");
  doc.moveDown();

  doc.text("C.c.: Archivo");
  doc.moveDown();

  doc.text("Asunto: Traslado de Documentación");
  doc.text(`Fecha: Guatemala, ${new Date().toLocaleDateString("es-GT")}`);
  doc.moveDown();

  doc.text("Atentamente me dirijo a ustedes, con el objeto de trasladar la documentación siguiente:");
  doc.moveDown();

  // Tabla
  doc.font("Helvetica-Bold").text("No.", 50);
  doc.text("No. de Oficio", 100);
  doc.text("Programa/Subprograma", 250);
  doc.moveDown();

  doc.font("Helvetica");
  detalle.forEach((d, i) => {
    doc.text(String(i + 1).padStart(2, "0"), 50);
    doc.text(d.numero_documento, 100);
    doc.text(`Traslado para: ${d.programa}/${d.subprograma}`, 250);
    doc.moveDown();
  });

  doc.end();
});

export default router;