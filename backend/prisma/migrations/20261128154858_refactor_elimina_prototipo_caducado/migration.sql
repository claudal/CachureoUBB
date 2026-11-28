/*
  Warnings:

  - You are about to drop the `destino_caducidad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tratamiento_caducidad` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tratamiento_caducidad" DROP CONSTRAINT "tratamiento_caducidad_id_destino_fkey";

-- DropForeignKey
ALTER TABLE "tratamiento_caducidad" DROP CONSTRAINT "tratamiento_caducidad_id_objeto_fkey";

-- DropForeignKey
ALTER TABLE "tratamiento_caducidad" DROP CONSTRAINT "tratamiento_caducidad_rut_encargado_fkey";

-- DropTable
DROP TABLE "destino_caducidad";

-- DropTable
DROP TABLE "tratamiento_caducidad";
