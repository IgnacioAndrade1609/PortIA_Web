export async function exportToExcel(nombreArchivo: string, filas: Record<string, unknown>[]): Promise<void> {
  const XLSX = await import('xlsx');
  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}
