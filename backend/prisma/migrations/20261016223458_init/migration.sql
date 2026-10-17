-- CreateTable
CREATE TABLE "campus" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "direccion" TEXT,

    CONSTRAINT "campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_objeto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "estado_objeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_alerta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "estado_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiqueta_objeto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "etiqueta_objeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destino_caducidad" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "destino_caducidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrador" (
    "correo" VARCHAR(255) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("correo")
);

-- CreateTable
CREATE TABLE "reclamante" (
    "rut" VARCHAR(9) NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre_reclamante" VARCHAR(150) NOT NULL,

    CONSTRAINT "reclamante_pkey" PRIMARY KEY ("rut")
);

-- CreateTable
CREATE TABLE "oficina" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "id_campus" INTEGER NOT NULL,

    CONSTRAINT "oficina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encargado_oficina" (
    "rut" VARCHAR(9) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "correo_contacto" VARCHAR(255) NOT NULL,
    "clave" VARCHAR(255) NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "reinicio_clave" BOOLEAN NOT NULL DEFAULT false,
    "id_oficina" INTEGER NOT NULL,

    CONSTRAINT "encargado_oficina_pkey" PRIMARY KEY ("rut")
);

-- CreateTable
CREATE TABLE "objeto_perdido" (
    "id" SERIAL NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "id_estado" INTEGER NOT NULL,
    "id_oficina" INTEGER NOT NULL,

    CONSTRAINT "objeto_perdido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_busqueda" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_edicion" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_campus" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,

    CONSTRAINT "alerta_busqueda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(500) NOT NULL,

    CONSTRAINT "foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega" (
    "id" SERIAL NOT NULL,
    "fecha_entrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentarios" TEXT,
    "rut_reclamante" VARCHAR(12) NOT NULL,
    "rut_encargado" VARCHAR(12) NOT NULL,
    "id_objeto" INTEGER NOT NULL,
    "id_foto" INTEGER NOT NULL,

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_objeto" (
    "id_foto" INTEGER NOT NULL,
    "id_objeto" INTEGER NOT NULL,

    CONSTRAINT "foto_objeto_pkey" PRIMARY KEY ("id_foto","id_objeto")
);

-- CreateTable
CREATE TABLE "foto_oficina" (
    "id_foto" INTEGER NOT NULL,
    "id_oficina" INTEGER NOT NULL,

    CONSTRAINT "foto_oficina_pkey" PRIMARY KEY ("id_foto","id_oficina")
);

-- CreateTable
CREATE TABLE "foto_alerta" (
    "id_foto" INTEGER NOT NULL,
    "id_alerta" INTEGER NOT NULL,

    CONSTRAINT "foto_alerta_pkey" PRIMARY KEY ("id_foto","id_alerta")
);

-- CreateTable
CREATE TABLE "objeto_tiene_etiqueta" (
    "id_objeto" INTEGER NOT NULL,
    "id_etiqueta" INTEGER NOT NULL,

    CONSTRAINT "objeto_tiene_etiqueta_pkey" PRIMARY KEY ("id_objeto","id_etiqueta")
);

-- CreateTable
CREATE TABLE "marcador_encargado" (
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" VARCHAR(12) NOT NULL,

    CONSTRAINT "marcador_encargado_pkey" PRIMARY KEY ("id_alerta","rut_encargado")
);

-- CreateTable
CREATE TABLE "alerta_leida" (
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" VARCHAR(12) NOT NULL,

    CONSTRAINT "alerta_leida_pkey" PRIMARY KEY ("id_alerta","rut_encargado")
);

-- CreateTable
CREATE TABLE "cierre_alerta" (
    "id_alerta" INTEGER NOT NULL,
    "id_entrega" INTEGER NOT NULL,

    CONSTRAINT "cierre_alerta_pkey" PRIMARY KEY ("id_alerta","id_entrega")
);

-- CreateTable
CREATE TABLE "solicitud_detalles" (
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" VARCHAR(12) NOT NULL,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicaciones" TEXT NOT NULL,

    CONSTRAINT "solicitud_detalles_pkey" PRIMARY KEY ("id_alerta","rut_encargado")
);

-- CreateTable
CREATE TABLE "reunion" (
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" VARCHAR(12) NOT NULL,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicaciones" TEXT NOT NULL,
    "id_oficina" INTEGER NOT NULL,

    CONSTRAINT "reunion_pkey" PRIMARY KEY ("id_alerta","rut_encargado")
);

-- CreateTable
CREATE TABLE "tratamiento_caducidad" (
    "id_objeto" INTEGER NOT NULL,
    "rut_encargado" VARCHAR(12) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "razon" TEXT NOT NULL,
    "id_destino" INTEGER NOT NULL,

    CONSTRAINT "tratamiento_caducidad_pkey" PRIMARY KEY ("id_objeto","rut_encargado")
);

-- CreateIndex
CREATE UNIQUE INDEX "entrega_id_foto_key" ON "entrega"("id_foto");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_alerta_id_alerta_key" ON "cierre_alerta"("id_alerta");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_alerta_id_entrega_key" ON "cierre_alerta"("id_entrega");

-- AddForeignKey
ALTER TABLE "oficina" ADD CONSTRAINT "oficina_id_campus_fkey" FOREIGN KEY ("id_campus") REFERENCES "campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encargado_oficina" ADD CONSTRAINT "encargado_oficina_id_oficina_fkey" FOREIGN KEY ("id_oficina") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objeto_perdido" ADD CONSTRAINT "objeto_perdido_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "estado_objeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objeto_perdido" ADD CONSTRAINT "objeto_perdido_id_oficina_fkey" FOREIGN KEY ("id_oficina") REFERENCES "oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_busqueda" ADD CONSTRAINT "alerta_busqueda_id_campus_fkey" FOREIGN KEY ("id_campus") REFERENCES "campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_busqueda" ADD CONSTRAINT "alerta_busqueda_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "estado_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_rut_reclamante_fkey" FOREIGN KEY ("rut_reclamante") REFERENCES "reclamante"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_id_objeto_fkey" FOREIGN KEY ("id_objeto") REFERENCES "objeto_perdido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_objeto" ADD CONSTRAINT "foto_objeto_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "foto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_objeto" ADD CONSTRAINT "foto_objeto_id_objeto_fkey" FOREIGN KEY ("id_objeto") REFERENCES "objeto_perdido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_oficina" ADD CONSTRAINT "foto_oficina_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "foto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_oficina" ADD CONSTRAINT "foto_oficina_id_oficina_fkey" FOREIGN KEY ("id_oficina") REFERENCES "oficina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_alerta" ADD CONSTRAINT "foto_alerta_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "foto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_alerta" ADD CONSTRAINT "foto_alerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objeto_tiene_etiqueta" ADD CONSTRAINT "objeto_tiene_etiqueta_id_objeto_fkey" FOREIGN KEY ("id_objeto") REFERENCES "objeto_perdido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objeto_tiene_etiqueta" ADD CONSTRAINT "objeto_tiene_etiqueta_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "etiqueta_objeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcador_encargado" ADD CONSTRAINT "marcador_encargado_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcador_encargado" ADD CONSTRAINT "marcador_encargado_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_leida" ADD CONSTRAINT "alerta_leida_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_leida" ADD CONSTRAINT "alerta_leida_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_alerta" ADD CONSTRAINT "cierre_alerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_alerta" ADD CONSTRAINT "cierre_alerta_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "entrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_detalles" ADD CONSTRAINT "solicitud_detalles_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_detalles" ADD CONSTRAINT "solicitud_detalles_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reunion" ADD CONSTRAINT "reunion_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alerta_busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reunion" ADD CONSTRAINT "reunion_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reunion" ADD CONSTRAINT "reunion_id_oficina_fkey" FOREIGN KEY ("id_oficina") REFERENCES "oficina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_caducidad" ADD CONSTRAINT "tratamiento_caducidad_id_objeto_fkey" FOREIGN KEY ("id_objeto") REFERENCES "objeto_perdido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_caducidad" ADD CONSTRAINT "tratamiento_caducidad_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "encargado_oficina"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamiento_caducidad" ADD CONSTRAINT "tratamiento_caducidad_id_destino_fkey" FOREIGN KEY ("id_destino") REFERENCES "destino_caducidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
