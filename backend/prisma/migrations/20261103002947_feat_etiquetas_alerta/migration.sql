-- CreateTable
CREATE TABLE "alerta_tiene_etiqueta" (
    "id_alerta" TEXT NOT NULL,
    "id_etiqueta" INTEGER NOT NULL,

    CONSTRAINT "alerta_tiene_etiqueta_pkey" PRIMARY KEY ("id_alerta","id_etiqueta")
);

-- AddForeignKey
ALTER TABLE "alerta_tiene_etiqueta" ADD CONSTRAINT "alerta_tiene_etiqueta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_tiene_etiqueta" ADD CONSTRAINT "alerta_tiene_etiqueta_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "etiqueta_objeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
