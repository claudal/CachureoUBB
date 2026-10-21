/*
  Warnings:

  - The primary key for the `alerta_busqueda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `alerta_leida` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `cierre_alerta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `foto_alerta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `marcador_encargado` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reunion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `solicitud_detalles` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "alerta_leida" DROP CONSTRAINT "alerta_leida_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "cierre_alerta" DROP CONSTRAINT "cierre_alerta_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "foto_alerta" DROP CONSTRAINT "foto_alerta_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "marcador_encargado" DROP CONSTRAINT "marcador_encargado_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "reunion" DROP CONSTRAINT "reunion_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "solicitud_detalles" DROP CONSTRAINT "solicitud_detalles_id_alerta_fkey";

-- AlterTable
ALTER TABLE "alerta_busqueda" DROP CONSTRAINT "alerta_busqueda_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "alerta_busqueda_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "alerta_busqueda_id_seq";

-- AlterTable
ALTER TABLE "alerta_leida" DROP CONSTRAINT "alerta_leida_pkey",
ALTER COLUMN "id_alerta" SET DATA TYPE TEXT,
ADD CONSTRAINT "alerta_leida_pkey" PRIMARY KEY ("id_alerta", "rut_encargado");

-- AlterTable
ALTER TABLE "cierre_alerta" DROP CONSTRAINT "cierre_alerta_pkey",
ALTER COLUMN "id_alerta" SET DATA TYPE TEXT,
ADD CONSTRAINT "cierre_alerta_pkey" PRIMARY KEY ("id_alerta", "id_entrega");

-- AlterTable
ALTER TABLE "foto_alerta" DROP CONSTRAINT "foto_alerta_pkey",
ALTER COLUMN "id_alerta" SET DATA TYPE TEXT,
ADD CONSTRAINT "foto_alerta_pkey" PRIMARY KEY ("id_foto", "id_alerta");

-- AlterTable
ALTER TABLE "marcador_encargado" DROP CONSTRAINT "marcador_encargado_pkey",
ALTER COLUMN "id_alerta" SET DATA TYPE TEXT,
ADD CONSTRAINT "marcador_encargado_pkey" PRIMARY KEY ("id_alerta", "rut_encargado");

-- AlterTable
ALTER TABLE "reunion" DROP CONSTRAINT "reunion_pkey",
ALTER COLUMN "id_alerta" SET DATA TYPE TEXT,
ADD CONSTRAINT "reunion_pkey" PRIMARY KEY ("id_alerta", "rut_encargado");

-- AlterTable
ALTER TABLE "solicitud_detalles" DROP CONSTRAINT "solicitud_detalles_pkey",
ALTER COLUMN "id_alerta" SET DATA TYPE TEXT,
ADD CONSTRAINT "solicitud_detalles_pkey" PRIMARY KEY ("id_alerta", "rut_encargado");

-- AddForeignKey
ALTER TABLE "foto_alerta" ADD CONSTRAINT "foto_alerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcador_encargado" ADD CONSTRAINT "marcador_encargado_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_leida" ADD CONSTRAINT "alerta_leida_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_alerta" ADD CONSTRAINT "cierre_alerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_detalles" ADD CONSTRAINT "solicitud_detalles_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reunion" ADD CONSTRAINT "reunion_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
