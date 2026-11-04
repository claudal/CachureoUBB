import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SelectorEtiquetasObjeto from '../components/SelectorEtiquetasObjeto.jsx';
import { RegistrarObjetoSchema, MAXIMO_FOTOS_OBJETO } from '../schemas/objetoPerdido.schema.js';
import * as objetoPerdidoService from '../services/objetoPerdidoService.js';
import CargaImagenes from '../components/CargaImagenes.jsx';

// constante fuera del componente para que el selector no recargue las etiquetas en cada render
const filtroTodasEtiquetas = {};

const ID_FORMULARIO = 'form-registrar-objeto';

export default function RegistrarObjetoPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [hayEtiquetaValiosa, setHayEtiquetaValiosa] = useState(false);

  const formulario = useForm({
    resolver: zodResolver(RegistrarObjetoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      etiquetas: [],
      valioso: false,
      fotos: []
    }
  });

  async function onSubmit(datos) {
    setApiError(null);
    try {
      const objeto = await objetoPerdidoService.crear(datos);
      navigate('/menuOficina', { state: { mensaje: `El objeto "${objeto.nombre}" quedó registrado.` } });
    } catch (err) {
      // los errores de validación del backend se muestran en su campo
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      setApiError(err.message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 pb-28">
      <Button variant="ghost" className="mb-2" onClick={() => navigate('/menuOficina')}>
        <ArrowLeftIcon /> Volver a mis objetos
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Registrar objeto perdido</CardTitle>
          <CardDescription>
            Ingrese los datos del objeto que llegó a su oficina. Todos los campos son obligatorios, excepto "Objeto de valor".
          </CardDescription>
          {apiError && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo registrar el objeto</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          <form id={ID_FORMULARIO} onSubmit={formulario.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="nombre"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="objeto-nombre">Nombre corto</FieldLabel>
                    <Input
                      {...field}
                      id="objeto-nombre"
                      aria-invalid={fieldState.invalid}
                      placeholder="Botella azul metálica"
                      autoComplete="off"
                      className="h-10"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="descripcion"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="objeto-descripcion">Descripción</FieldLabel>
                    <Textarea
                      {...field}
                      id="objeto-descripcion"
                      aria-invalid={fieldState.invalid}
                      placeholder="Color, marca, tamaño, dónde se encontró, detalles que ayuden a reconocerlo..."
                      className="min-h-28"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="etiquetas"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="objeto-etiquetas">Etiquetas</FieldLabel>
                    <SelectorEtiquetasObjeto
                      id="objeto-etiquetas"
                      field={field}
                      filtro={filtroTodasEtiquetas}
                      invalido={fieldState.invalid}
                      onSeleccion={(etiquetas) => {
                        const esValioso = etiquetas.some((e) => e.valioso);
                        setHayEtiquetaValiosa(esValioso);
                        if (esValioso) {
                          formulario.setValue('valioso', true, { shouldValidate: true });
                        }
                      }}
                    />
                    <FieldDescription>Elija una o más etiquetas que describan el objeto.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="valioso"
                control={formulario.control}
                render={({ field }) => (
                  <Field orientation="horizontal" data-disabled={hayEtiquetaValiosa}>
                    <Checkbox
                      id="objeto-valioso"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={hayEtiquetaValiosa}
                      inputRef={field.ref}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="objeto-valioso">Objeto de valor</FieldLabel>
                      <FieldDescription>
                        {hayEtiquetaValiosa
                          ? 'Se marcó automáticamente porque eligió una etiqueta de objeto valioso.'
                          : 'Márquelo si, según su criterio, el objeto es de valor. No se mostrará en el catálogo público y su entrega pedirá una verificación extra.'}
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                name="fotos"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <CargaImagenes field={field} fieldState={fieldState} max={MAXIMO_FOTOS_OBJETO} />
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigate('/menuOficina')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={ID_FORMULARIO}
            size="lg"
            className="w-full sm:w-auto"
            disabled={formulario.formState.isSubmitting}
          >
            {formulario.formState.isSubmitting ? 'Registrando...' : 'Registrar objeto'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
