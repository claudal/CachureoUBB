/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `foto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "foto_url_key" ON "foto"("url");
