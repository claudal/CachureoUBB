/*
  Warnings:

  - You are about to alter the column `contrasena` on the `Persona` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(60)`.

*/
-- AlterTable
ALTER TABLE "Persona" ALTER COLUMN "contrasena" SET DATA TYPE VARCHAR(60);
