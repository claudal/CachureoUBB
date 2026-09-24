-- CreateTable
CREATE TABLE "Persona" (
    "rut" VARCHAR(9) NOT NULL,
    "nombre" VARCHAR(63) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(15) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("rut")
);

-- CreateTable
CREATE TABLE "EstadoObjeto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(15) NOT NULL,

    CONSTRAINT "EstadoObjeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjetoPerdido" (
    "id" SERIAL NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" VARCHAR(31) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "rut_encargado" TEXT NOT NULL,

    CONSTRAINT "ObjetoPerdido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoObjeto" (
    "id_foto" INTEGER NOT NULL,
    "id_objeto" INTEGER NOT NULL,

    CONSTRAINT "FotoObjeto_pkey" PRIMARY KEY ("id_foto","id_objeto")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(31) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UbicacionEncargado" (
    "id_encargado" TEXT NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,

    CONSTRAINT "UbicacionEncargado_pkey" PRIMARY KEY ("id_encargado","id_ubicacion")
);

-- CreateTable
CREATE TABLE "FotoUbicacion" (
    "id_foto" INTEGER NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,

    CONSTRAINT "FotoUbicacion_pkey" PRIMARY KEY ("id_foto","id_ubicacion")
);

-- CreateTable
CREATE TABLE "EstadoAlerta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(15) NOT NULL,

    CONSTRAINT "EstadoAlerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaBusqueda" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_edicion" TIMESTAMP(3) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "rut_autor" TEXT NOT NULL,

    CONSTRAINT "AlertaBusqueda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarcadorEncargado" (
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" TEXT NOT NULL,

    CONSTRAINT "MarcadorEncargado_pkey" PRIMARY KEY ("id_alerta","rut_encargado")
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" SERIAL NOT NULL,
    "fecha_entrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rut_reclamante" VARCHAR(9) NOT NULL,
    "nombre_reclamante" VARCHAR(63) NOT NULL,
    "id_objeto" INTEGER NOT NULL,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoAlerta" (
    "id_foto" INTEGER NOT NULL,
    "id_alerta" INTEGER NOT NULL,

    CONSTRAINT "FotoAlerta_pkey" PRIMARY KEY ("id_foto","id_alerta")
);

-- CreateTable
CREATE TABLE "CierreAlerta" (
    "id_alerta" INTEGER NOT NULL,
    "id_entrega" INTEGER NOT NULL,

    CONSTRAINT "CierreAlerta_pkey" PRIMARY KEY ("id_alerta","id_entrega")
);

-- CreateTable
CREATE TABLE "SolicitudDetalles" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicaciones" VARCHAR(255) NOT NULL,
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" TEXT NOT NULL,

    CONSTRAINT "SolicitudDetalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reunion" (
    "id" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicaciones" VARCHAR(255) NOT NULL,
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" TEXT NOT NULL,

    CONSTRAINT "Reunion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaLeida" (
    "id_alerta" INTEGER NOT NULL,
    "rut_encargado" TEXT NOT NULL,

    CONSTRAINT "AlertaLeida_pkey" PRIMARY KEY ("id_alerta","rut_encargado")
);

-- AddForeignKey
ALTER TABLE "ObjetoPerdido" ADD CONSTRAINT "ObjetoPerdido_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "EstadoObjeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjetoPerdido" ADD CONSTRAINT "ObjetoPerdido_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoObjeto" ADD CONSTRAINT "FotoObjeto_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoObjeto" ADD CONSTRAINT "FotoObjeto_id_objeto_fkey" FOREIGN KEY ("id_objeto") REFERENCES "ObjetoPerdido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UbicacionEncargado" ADD CONSTRAINT "UbicacionEncargado_id_encargado_fkey" FOREIGN KEY ("id_encargado") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UbicacionEncargado" ADD CONSTRAINT "UbicacionEncargado_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoUbicacion" ADD CONSTRAINT "FotoUbicacion_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoUbicacion" ADD CONSTRAINT "FotoUbicacion_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaBusqueda" ADD CONSTRAINT "AlertaBusqueda_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "EstadoAlerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaBusqueda" ADD CONSTRAINT "AlertaBusqueda_rut_autor_fkey" FOREIGN KEY ("rut_autor") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarcadorEncargado" ADD CONSTRAINT "MarcadorEncargado_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarcadorEncargado" ADD CONSTRAINT "MarcadorEncargado_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_id_objeto_fkey" FOREIGN KEY ("id_objeto") REFERENCES "ObjetoPerdido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAlerta" ADD CONSTRAINT "FotoAlerta_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAlerta" ADD CONSTRAINT "FotoAlerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CierreAlerta" ADD CONSTRAINT "CierreAlerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CierreAlerta" ADD CONSTRAINT "CierreAlerta_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "Entrega"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDetalles" ADD CONSTRAINT "SolicitudDetalles_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDetalles" ADD CONSTRAINT "SolicitudDetalles_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reunion" ADD CONSTRAINT "Reunion_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reunion" ADD CONSTRAINT "Reunion_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaLeida" ADD CONSTRAINT "AlertaLeida_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaLeida" ADD CONSTRAINT "AlertaLeida_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;
