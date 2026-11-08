import fs from 'fs/promises';
import path from 'path';

export async function cargarPlantillaEmail(nombreArchivo, variables = {}) {
  const rutaArchivo = path.join(process.cwd(), 'src', 'templates', 'emails', nombreArchivo);
  let html = await fs.readFile(rutaArchivo, 'utf-8');

  // Reemplazar todos los {{VARIABLE}} con los datos reales
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, variables[key]);
  });

  return html;
}