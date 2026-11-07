/*
  Warnings:

  - You are about to drop the column `habilitado` on the `encargado_oficina` table. All the data in the column will be lost.
  - You are about to drop the column `reinicio_clave` on the `encargado_oficina` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "encargado_oficina" DROP COLUMN "habilitado",
DROP COLUMN "reinicio_clave",
ADD COLUMN     "id_estado" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "estado_encargado" (
    "id" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "estado_encargado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "encargado_oficina" ADD CONSTRAINT "encargado_oficina_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "estado_encargado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
