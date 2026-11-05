import { prisma } from "../config/prisma.js";


import fs from 'node:fs/promises';
import path from 'node:path';

export function crear(url){
    return prisma.foto.create({data:{url}});
}

/**
 * 
 * @param {import("@prisma/client").AlertaBusqueda.idAlerta} idAlerta
 * @returns 
 */
export function eliminar(id){
    return prisma.alertaBusqueda.delete({where:{id}});
}

export async function eliminarArchivoFisico(urlRelativa) {
  if (!urlRelativa) return;
  try {
    const rutaAbsoluta = path.join(process.cwd(), 'uploads', path.basename(urlRelativa));
    await fs.unlink(rutaAbsoluta);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`No se pudo borrar el archivo (${urlRelativa}):`, error.message);
    }
  }
}