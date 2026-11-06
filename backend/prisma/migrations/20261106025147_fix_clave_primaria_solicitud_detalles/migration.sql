/*
  Warnings:

  - The primary key for the `solicitud_detalles` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "solicitud_detalles" DROP CONSTRAINT "solicitud_detalles_pkey",
ADD CONSTRAINT "solicitud_detalles_pkey" PRIMARY KEY ("id_alerta", "rut_encargado", "fecha_creacion");
