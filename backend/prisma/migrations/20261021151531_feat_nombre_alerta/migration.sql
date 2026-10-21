/*
  Warnings:

  - Added the required column `nombre` to the `alerta_busqueda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alerta_busqueda" ADD COLUMN     "nombre" VARCHAR(63) NOT NULL;
