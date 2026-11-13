// routes/nota_traslado_docto.js

import express from 'express';
import supabase from '../db.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const logoPath = path.join(__dirname, '../public/LogoMiDes.png');
    const piePath = path.join(__dirname, '../public/Pie de Pagina MiDes.png');

    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
    const pieBase64 = fs.readFileSync(piePath, { encoding: 'base64' });

    const doc = new jsPDF('p', 'mm', 'letter');
    const fecha = new Date();
    const programa = data[0]?.programa || '';
    const fechaTexto = fecha.toLocaleDateString('es-GT', {day: 'numeric',month: 'long',year: 'numeric'});

    doc.addImage( `data:image/png;base64,${logoBase64}`,'PNG',10,5,195,25);    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('NOTA DE TRASLADO', 105, 40, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`DCO-${nota}-2026/ESP/${iniciales}`, 20, 50, { align: 'center' });

    doc.setFont('helvetica', 'normal');

    doc.text('De:', 20, 60);
    doc.text('Licenciado Estuardo Samayoa Prado', 35, 60);

    doc.text('Director, Dirección de Coordinación y Organización', 35, 51);

    doc.text('Para:', 20, 78);
    doc.text('Subdirección Técnica', 35, 78);


     doc.text('Asunto:', 20, 90);
     doc.text(`-Documentación ${programa}-`, 35, 90);

    doc.text('Fecha:', 20, 102);
    doc.text(`Guatemala, ${fechaTexto}`, 35, 102);

    doc.text('Atentamente me dirijo a ustedes con el objeto de trasladar la documentación siguiente:',20,115);

    autoTable(doc, {
      startY: 125,
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

    doc.addImage(`data:image/png;base64,${pieBase64}`,'PNG',5,245,205,30);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename=NotaTraslado_${nota}.pdf`);

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Error al generar PDF'
    });
  }

});

export default router;