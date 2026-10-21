// src/components/ExportExcel.jsx
import React from "react";
import * as XLSX from "xlsx";

function ExportExcel({ data, columns, fileName }) {
  const exportToExcel = () => {
    const worksheetData = data.map((row) =>
      columns.reduce((acc, col) => {
        acc[col.header] = row[col.key];
        return acc;
      }, {})
    );

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <button onClick={exportToExcel} className="boton-exportar">
      Exportar Excel
    </button>
  );
}

export default ExportExcel;