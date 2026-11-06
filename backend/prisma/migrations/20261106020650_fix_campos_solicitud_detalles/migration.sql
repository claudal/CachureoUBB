/*
  Warnings:

  - You are about to alter the column `descripcion` on the `objeto_perdido` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to drop the column `fecha_modificacion` on the `reunion` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_modificacion` on the `solicitud_detalles` table. All the data in the column will be lost.
  - You are about to alter the column `indicaciones` on the `solicitud_detalles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "objeto_perdido" ALTER COLUMN "descripcion" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "reunion" DROP COLUMN "fecha_modificacion",
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "solicitud_detalles" DROP COLUMN "fecha_modificacion",
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "indicaciones" SET DATA TYPE VARCHAR(500);
