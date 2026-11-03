/*
  Warnings:

  - Added the required column `esValioso` to the `objeto_perdido` table without a default value. This is not possible if the table is not empty.
  - Made the column `descripcion` on table `objeto_perdido` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "objeto_perdido" ADD COLUMN     "esValioso" BOOLEAN NOT NULL,
ALTER COLUMN "descripcion" SET NOT NULL;
