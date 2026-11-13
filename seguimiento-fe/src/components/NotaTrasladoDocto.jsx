// scr/components/NotaTrasladoDocto.jsx

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoHead from "../assets/LogoMiDes.png";
import logoFoot from "../assets/PiePaginaMiDes.png";

export const generarNotaTrasladoDoc = async (nota, iniciales) => {
 
//    const res = await fetch(`localhost:3000/recepcion_envios/nota/${nota}`);
    const res = await fetch(`https://seguimiento-be-production-7e17.up.railway.app/recepcion_envios/nota/${nota}`);
    const data = await res.json();

    const doc = new jsPDF('p', 'mm', 'letter');
    const fecha = new Date();
    const programa = data[0]?.programa || '';
    const fechaTexto = fecha.toLocaleDateString('es-GT', {day: 'numeric',month: 'long',year: 'numeric'});

    doc.addImage( logoHead,'PNG',10,5,195,25);    
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

    doc.addImage(logoFoot,'PNG',5,245,205,30);

    // Descargar
  doc.save(`Nota_de_Traslado_${nota}.pdf`);
};