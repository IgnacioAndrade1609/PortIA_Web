export async function exportToExcel(nombreArchivo: string, filas: Record<string, unknown>[]): Promise<void> {
  const XLSX = await import('xlsx');
  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}

export async function parseExcelFile(archivo: File): Promise<Record<string, string>[]> {
  const XLSX = await import('xlsx');
  const buffer = await archivo.arrayBuffer();
  const formatoFecha = 'dd-mm-yyyy';
  const libro = XLSX.read(buffer, { type: 'array', dateNF: formatoFecha });
  const primeraHoja = libro.Sheets[libro.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(primeraHoja, { raw: false, defval: '', dateNF: formatoFecha });
}
