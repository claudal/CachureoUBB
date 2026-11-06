/*
  Warnings:

  - You are about to drop the column `contrasena` on the `administrador` table. All the data in the column will be lost.
  - Added the required column `clave` to the `administrador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "administrador" DROP COLUMN "contrasena",
ADD COLUMN     "clave" VARCHAR(255) NOT NULL;
