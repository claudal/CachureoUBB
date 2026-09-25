-- DropForeignKey
ALTER TABLE "AlertaLeida" DROP CONSTRAINT "AlertaLeida_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "AlertaLeida" DROP CONSTRAINT "AlertaLeida_rut_encargado_fkey";

-- DropForeignKey
ALTER TABLE "CierreAlerta" DROP CONSTRAINT "CierreAlerta_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "CierreAlerta" DROP CONSTRAINT "CierreAlerta_id_entrega_fkey";

-- DropForeignKey
ALTER TABLE "FotoAlerta" DROP CONSTRAINT "FotoAlerta_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "FotoAlerta" DROP CONSTRAINT "FotoAlerta_id_foto_fkey";

-- DropForeignKey
ALTER TABLE "MarcadorEncargado" DROP CONSTRAINT "MarcadorEncargado_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "MarcadorEncargado" DROP CONSTRAINT "MarcadorEncargado_rut_encargado_fkey";

-- DropForeignKey
ALTER TABLE "Reunion" DROP CONSTRAINT "Reunion_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "Reunion" DROP CONSTRAINT "Reunion_rut_encargado_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudDetalles" DROP CONSTRAINT "SolicitudDetalles_id_alerta_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudDetalles" DROP CONSTRAINT "SolicitudDetalles_rut_encargado_fkey";

-- AddForeignKey
ALTER TABLE "MarcadorEncargado" ADD CONSTRAINT "MarcadorEncargado_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarcadorEncargado" ADD CONSTRAINT "MarcadorEncargado_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAlerta" ADD CONSTRAINT "FotoAlerta_id_foto_fkey" FOREIGN KEY ("id_foto") REFERENCES "Foto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAlerta" ADD CONSTRAINT "FotoAlerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CierreAlerta" ADD CONSTRAINT "CierreAlerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CierreAlerta" ADD CONSTRAINT "CierreAlerta_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "Entrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDetalles" ADD CONSTRAINT "SolicitudDetalles_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDetalles" ADD CONSTRAINT "SolicitudDetalles_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reunion" ADD CONSTRAINT "Reunion_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reunion" ADD CONSTRAINT "Reunion_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaLeida" ADD CONSTRAINT "AlertaLeida_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "AlertaBusqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaLeida" ADD CONSTRAINT "AlertaLeida_rut_encargado_fkey" FOREIGN KEY ("rut_encargado") REFERENCES "Persona"("rut") ON DELETE CASCADE ON UPDATE CASCADE;
