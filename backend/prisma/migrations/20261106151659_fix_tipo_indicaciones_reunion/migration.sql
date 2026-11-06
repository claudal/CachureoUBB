/*
  Warnings:

  - You are about to alter the column `indicaciones` on the `reunion` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "reunion" ALTER COLUMN "indicaciones" SET DATA TYPE VARCHAR(500);
