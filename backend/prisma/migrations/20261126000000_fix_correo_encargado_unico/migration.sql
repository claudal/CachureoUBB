-- Los correos se guardan en minusculas para que la unicidad no distinga mayusculas.
-- Si dos encargados ya comparten correo, la migracion falla: hay que corregirlos antes.
UPDATE "encargado_oficina" SET "correo_contacto" = LOWER(TRIM("correo_contacto"));

-- CreateIndex
CREATE UNIQUE INDEX "encargado_oficina_correo_contacto_key" ON "encargado_oficina"("correo_contacto");
