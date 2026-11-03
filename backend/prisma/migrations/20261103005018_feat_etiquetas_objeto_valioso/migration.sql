/*
  Warnings:

  - Added the required column `valioso` to the `etiqueta_objeto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "etiqueta_objeto" ADD COLUMN     "valioso" BOOLEAN NOT NULL;
