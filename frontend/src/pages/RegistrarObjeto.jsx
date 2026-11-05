import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { useNotify } from '../hooks/useNotify.js';

// constante fuera del componente para que el selector no recargue las etiquetas en cada render
const filtroTodasEtiquetas = {};
const filtroEtiquetasNoValiosas = {
  valioso: false
};

const ID_FORMULARIO = 'form-registrar-objeto';
const defaultValues = {
  nombre: '',
  descripcion: '',
  etiquetas: [],
  valioso: false,
  fotos: []
}

export default function RegistrarObjetoPage() {
  const { id } = useParams();
  const notification = useNotify();
  const esEdicion = Boolean(id);
  const [apiError, setApiError] = useState(null);
  const [cargando, setCargando] = useState(esEdicion);

  const navigate = useNavigate();
  const [hayEtiquetaValiosa, setHayEtiquetaValiosa] = useState(false);
  

  const formulario = useForm({
    resolver: zodResolver(RegistrarObjetoSchema),
    defaultValues
  });

  useEffect(() => {
    if (!esEdicion) return;

    async function cargarObjeto() {
      setCargando(true);
      setApiError(null);
      try {
        const datosObjeto = await objetoPerdidoService.buscarPorId(id);
        const etiquetas = datosObjeto.etiquetas?.map((e) => e.id) ?? [];
        // Mapear datos a la estructura del formulario
        formulario.reset({
          nombre: datosObjeto.nombre ?? '',
          descripcion: datosObjeto.descripcion ?? '',
          etiquetas: etiquetas,
          valioso: datosObjeto.valioso ?? false,
          fotos: datosObjeto.fotos ?? []
        });
        setHayEtiquetaValiosa(datosObjeto.valioso ?? false);
      } catch (err) {
        navigate('/menuOficina', { state: { mensaje: `No se pudo cargar el objeto: ${err.message}` } });
      } finally {
        setCargando(false);
      }
    }

    cargarObjeto();
  }, [esEdicion]);

  async function onSubmit(datos) {
    setApiError(null);
    try {
      if(esEdicion) {
        await objetoPerdidoService.actualizar(id,datos)
        notification.exito(`Objeto editado correctamente`);
      } else {
        await objetoPerdidoService.crear(datos);
        notification.exito(`Objeto registrado correctamente`);
      }
      navigate('/menuOficina');
    } catch (err) {
      // los errores de validación del backend se muestran en su campo
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      notification.error(`Error al ${esEdicion ? 'editar' : 'registrar'} el objeto`);
      setApiError(err.message);
    }
  }


  return (
    <div className="mx-auto w-full max-w-2xl p-4 pb-28">
      <Button variant="ghost" className="mb-2" onClick={() => navigate('/menuOficina')}>
        <ArrowLeftIcon /> Volver a mis objetos
      </Button>
      {cargando ? <ItemCargando texto='Cargando objeto...' />: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{esEdicion ? 'Editar' : 'Registrar'} objeto perdido</CardTitle>
            {!esEdicion && (
              <CardDescription>
                Ingrese los datos del objeto que llegó a su oficina. Todos los campos son obligatorios, excepto "Objeto de valor".
              </CardDescription>
            )}
            
            {apiError && (
              <Alert variant="destructive">
                <AlertTitle>No se pudo {esEdicion ? 'editar' : 'registrar'} el objeto</AlertTitle>
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
                      { esEdicion ? (
                        
                          <SelectorEtiquetasObjeto
                            id="objeto-etiquetas"
                            field={field}
                            filtro={ hayEtiquetaValiosa ? filtroTodasEtiquetas : filtroEtiquetasNoValiosas }
                            invalido={fieldState.invalid}
                          />
                        ) : (
                          <SelectorEtiquetasObjeto
                            id="objeto-etiquetas"
                            field={field}
                            filtro={ filtroTodasEtiquetas }
                            invalido={fieldState.invalid}
                            onSeleccion={(etiquetas) => {
                              const esValioso = etiquetas.some((e) => e.valioso);
                              setHayEtiquetaValiosa(esValioso);
                              if (esValioso) {
                                formulario.setValue('valioso', true, { shouldValidate: true });
                              }
                            }}
                          />
                        )
                      }
                      <FieldDescription>Elija una o más etiquetas que describan el objeto.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="valioso"
                  control={formulario.control}
                  render={({ field }) => (
                    <Field orientation="horizontal" data-disabled={hayEtiquetaValiosa || esEdicion}>
                      <Checkbox
                        id="objeto-valioso"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={hayEtiquetaValiosa || esEdicion}
                        inputRef={field.ref}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="objeto-valioso">Objeto de valor</FieldLabel>
                        <FieldDescription>
                          {esEdicion ? (
                            'No puede cambiar el estado de valor del objeto.'
                          ) : (
                            hayEtiquetaValiosa ?
                              'Se marcó automáticamente porque eligió una etiqueta de objeto valioso.' :
                              'Márquelo si, según su criterio, el objeto es de valor. No se mostrará en el catálogo público y su entrega pedirá una verificación extra.'
                          )}
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
              {formulario.formState.isSubmitting ? 'Registrando...' : (esEdicion ? 'Editar objeto' : 'Registrar objeto')}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
