// routes/nota_traslado_docto.js

import express from 'express';
import supabase from '../db.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const router = express.Router();

router.get('/:nota/:iniciales', async (req, res) => {

  const { nota, iniciales } = req.params;

  const { data, error } = await supabase
    .from('detalle_envios')
    .select('*')
    .eq('nota_traslado', nota)
    .eq('estado', 'R')
    .order('numero_documento', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'No existen documentos para esta nota.' });
  }

  try {

    const doc = new jsPDF('p', 'mm', 'letter');

    const fecha = new Date();

    const fechaTexto =
      fecha.toLocaleDateString('es-GT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('NOTA DE TRASLADO', 105, 25, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`DCO-${nota}-2026/ESP/${iniciales}`, 20, 35);

    doc.setFont('helvetica', 'normal');

    doc.text('De:', 20, 45);
    doc.text('Licenciado Estuardo Samayoa Prado', 35, 45);

    doc.text('Director, Dirección de Coordinación y Organización', 35, 51);

    doc.text('Para:', 20, 63);
    doc.text('Subdirección Técnica', 35, 63);

    doc.text('Asunto:', 20, 75);
    doc.text('-DOCUMENTACIÓN BONO SOCIAL-', 35, 75);

    doc.text('Fecha:', 20, 87);
    doc.text(`Guatemala, ${fechaTexto}`, 35, 87);

    doc.text(
      'Atentamente me dirijo a ustedes con el objeto de trasladar la documentación siguiente:',
      20,
      100
    );

    autoTable(doc, {
      startY: 110,
      head: [['No.', 'PROGRAMA', 'OFICIO/MEMO', 'DESCRIPCIÓN']],
      body: data.map((item, index) => [
        index + 1,
        item.programa || '',
        item.numero_documento || '',
        item.descripcion || ''
      ]),
      theme: 'grid',
      styles: {
        fontSize: 9
      },
      headStyles: {
        fillColor: [41, 98, 255]
      }
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=NotaTraslado_${nota}.pdf`
    );

    res.send(pdfBuffer);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Error al generar PDF'
    });

  }

});

export default router;