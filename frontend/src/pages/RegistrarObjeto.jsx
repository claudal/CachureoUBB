import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ImagePlusIcon, XIcon } from 'lucide-react';

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

// constante fuera del componente para que el selector no recargue las etiquetas en cada render
const filtroTodasEtiquetas = {};

const ID_FORMULARIO = 'form-registrar-objeto';

function MiniaturaFoto({ archivo, onQuitar }) {
  const imagen = useRef(null);
  const [sinVistaPrevia, setSinVistaPrevia] = useState(false);

  // la url temporal se crea y se libera junto con la miniatura
  useEffect(() => {
    if (!imagen.current) return;
    const url = URL.createObjectURL(archivo);
    imagen.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  return (
    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border bg-muted">
      {!sinVistaPrevia ? (
        <img
          ref={imagen}
          alt={archivo.name}
          className="h-full w-full object-cover"
          onError={() => setSinVistaPrevia(true)}
        />
      ) : (
        // p. ej. fotos HEIC en navegadores que no las pueden mostrar
        <span className="line-clamp-3 break-all p-1 text-center text-xs text-muted-foreground">{archivo.name}</span>
      )}
      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        className="absolute right-1 top-1"
        onClick={onQuitar}
        aria-label={`Quitar foto ${archivo.name}`}
      >
        <XIcon />
      </Button>
    </div>
  );
}

export default function RegistrarObjetoPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [hayEtiquetaValiosa, setHayEtiquetaValiosa] = useState(false);
  const inputFotos = useRef(null);

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

  // al elegir una etiqueta valiosa (laptop, joya, ...) el objeto queda marcado como valioso
  useEffect(() => {
    if (hayEtiquetaValiosa)
      formulario.setValue('valioso', true);
  }, [hayEtiquetaValiosa, formulario]);

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
                      onSeleccion={(etiquetas) => setHayEtiquetaValiosa(etiquetas.some((e) => e.valioso))}
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
                render={({ field, fieldState }) => {
                  const fotos = field.value;
                  const agregarFotos = (evento) => {
                    const nuevas = Array.from(evento.target.files ?? []);
                    field.onChange([...fotos, ...nuevas]);
                    // permite volver a elegir el mismo archivo después de quitarlo
                    evento.target.value = '';
                  };
                  const quitarFoto = (indice) => field.onChange(fotos.filter((_, i) => i !== indice));
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="objeto-fotos">Fotos ({fotos.length} de {MAXIMO_FOTOS_OBJETO})</FieldLabel>
                      <input
                        ref={(elemento) => { inputFotos.current = elemento; field.ref(elemento); }}
                        id="objeto-fotos"
                        type="file"
                        accept="image/*,.heic,.heif"
                        multiple
                        className="sr-only"
                        onChange={agregarFotos}
                        onBlur={field.onBlur}
                      />
                      <div className="flex flex-wrap gap-2">
                        {fotos.map((foto, indice) => (
                          <MiniaturaFoto
                            key={`${foto.name}-${foto.lastModified}-${indice}`}
                            archivo={foto}
                            onQuitar={() => quitarFoto(indice)}
                          />
                        ))}
                        {fotos.length < MAXIMO_FOTOS_OBJETO && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-24 w-24 flex-col"
                            onClick={() => inputFotos.current?.click()}
                          >
                            <ImagePlusIcon className="size-6!" />
                            Agregar
                          </Button>
                        )}
                      </div>
                      <FieldDescription>Al menos una foto. JPG, PNG, WEBP o HEIC, de hasta 5 MB cada una.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  );
                }}
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
