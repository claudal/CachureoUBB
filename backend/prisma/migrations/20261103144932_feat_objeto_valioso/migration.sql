/*
  Warnings:

  - Made the column `descripcion` on table `objeto_perdido` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "objeto_perdido" ADD COLUMN     "valioso" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "descripcion" SET NOT NULL;
