/*
  Warnings:

  - You are about to alter the column `rut_reclamante` on the `entrega` table. The data in that column could be lost. The data in that column will be cast from `VarChar(12)` to `VarChar(9)`.
  - You are about to alter the column `rut_encargado` on the `entrega` table. The data in that column could be lost. The data in that column will be cast from `VarChar(12)` to `VarChar(9)`.

*/
-- DropForeignKey
ALTER TABLE "entrega" DROP CONSTRAINT "entrega_rut_encargado_fkey";

-- DropForeignKey
ALTER TABLE "entrega" DROP CONSTRAINT "entrega_rut_reclamante_fkey";

-- AlterTable
ALTER TABLE "entrega" ADD COLUMN     "caracteristica_verificacion" TEXT,
ALTER COLUMN "rut_reclamante" SET DATA TYPE VARCHAR(9),
ALTER COLUMN "rut_encargado" SET DATA TYPE VARCHAR(9),
ALTER COLUMN "id_foto" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_rut_reclamante_fkey" FOREIGN KEY ("rut_reclamante") REFERENCES "reclamante"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;
