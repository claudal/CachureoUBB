/*
  Warnings:

  - You are about to drop the column `rol` on the `Persona` table. All the data in the column will be lost.
  - Added the required column `id_rol` to the `Persona` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Persona" DROP COLUMN "rol",
ADD COLUMN     "id_rol" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RolPersona" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(31) NOT NULL,

    CONSTRAINT "RolPersona_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "RolPersona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
