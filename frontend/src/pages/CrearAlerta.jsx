import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SelectorEtiquetasObjeto from '../components/SelectorEtiquetasObjeto.jsx';
import CargaImagenes from '../components/CargaImagenes.jsx';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { useNotify } from '../hooks/useNotify.js';
import { CrearAlertaBusquedaSchema, MAXIMO_FOTOS_OBJETO } from '../schemas/alertaBusqueda.schema.js';

import * as alertaBusquedaService from '../services/alertaBusquedaService.js';
import { useAlertaLocal } from '../hooks/useAlertaLocal.js';
import Selector from '../components/Selector.jsx';
import { listar } from '../services/campusService.js';


// constante fuera del componente para que el selector no recargue las etiquetas en cada render
const filtroTodasEtiquetas = {};

const ID_FORMULARIO = 'form-crear-alerta';
const defaultValues = {
  nombre: '',
  descripcion: '',
  etiquetas: [],
  idSede: [],
  fotos: []
}

export default function CrearAlertaPage() {
  const alerta = useAlertaLocal();
  const notification = useNotify();
  const esEdicion = Boolean(alerta.id);
  const [apiError, setApiError] = useState(null);
  const [cargando, setCargando] = useState(esEdicion);

  const navigate = useNavigate();
  

  const formulario = useForm({
    resolver: zodResolver(CrearAlertaBusquedaSchema),
    defaultValues
  });

  useEffect(() => {
    if (!esEdicion) return;

    async function cargarAlerta() {
      setCargando(true);
      setApiError(null);
      try {
        const datosAlerta = await alertaBusquedaService.buscarPorId(id);
        const etiquetas = datosAlerta.etiquetas?.map((e) => e.id) ?? [];
        // Mapear datos a la estructura del formulario
        formulario.reset({
          nombre: datosAlerta.nombre ?? '',
          descripcion: datosAlerta.descripcion ?? '',
          etiquetas: etiquetas,
          fotos: datosAlerta.fotos ?? []
        });
      } catch (err) {
        navigate('/menuBusqueda/alertaBusqueda', { state: { mensaje: `No se pudo cargar la alerta: ${err.message}` } });
      } finally {
        setCargando(false);
      }
    }

    cargarAlerta();
  }, [esEdicion]);

  async function onSubmit(datos) {
    setApiError(null);
    try {
      if(esEdicion) {
        await alertaBusquedaService.actualizar(id,datos)
        notification.exito(`Alerta editada correctamente`);
        
      } else {
        alerta.setIdAlerta((await alertaBusquedaService.crear(datos)).idAlerta);
        notification.exito(`Alerta creada correctamente`);
      }
      navigate('/menuBusqueda/alertaBusqueda');
    } catch (err) {
      // los errores de validación del backend se muestran en su campo
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      notification.error(`Error al ${esEdicion ? 'editar' : 'registrar'} la alerta`);
      setApiError(err.message);
    }
  }


  return (
    <div className="mx-auto w-full max-w-2xl p-4 pb-28">
      <Button variant="ghost" className="mb-2" onClick={() => navigate('/menuBusqueda/alertaBusqueda')}>
        <ArrowLeftIcon /> Volver a la alerta
      </Button>
      {cargando ? <ItemCargando texto='Cargando alerta...' />: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{esEdicion ? 'Editar' : 'Crear'} alerta de búsqueda</CardTitle>
            {!esEdicion && (
              <CardDescription>
                Ingrese los datos del objeto de valor que se le perdió. Se requiere, al menos, un nombre fácil de identificar y una descripción del objeto.
              </CardDescription>
            )}
            
            {apiError && (
              <Alert variant="destructive">
                <AlertTitle>No se pudo {esEdicion ? 'editar' : 'crear'} la alerta</AlertTitle>
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
                      <FieldLabel htmlFor="alerta-nombre">Nombre corto</FieldLabel>
                      <Input
                        {...field}
                        id="alerta-nombre"
                        aria-invalid={fieldState.invalid}
                        placeholder="Laptop Asus Negra"
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
                      <FieldLabel htmlFor="alerta-descripcion">Descripción</FieldLabel>
                      <Textarea
                        {...field}
                        id="alerta-descripcion"
                        aria-invalid={fieldState.invalid}
                        placeholder="Color, marca, tamaño, modelo, lugar dónde lo perdió, detalles que ayuden a reconocerlo..."
                        className="min-h-28"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="idCampus"
                  control={formulario.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="objeto-etiquetas">Campus dónde buscar</FieldLabel>
                      <Selector 
                        onBlur={field.onBlur}
                        onSelect={field.onChange}
                        value={field.value}
                        invalid={fieldState.invalid}
                        id={"selector-campus"}
                        fn={listar}
                        textoCargando="Cargando campus..."
                        textoNoDatos="No se pudo cargar los campus"
                        textoVacio="Seleccione un campus"
                      />
                      <FieldDescription>Seleccione el campus donde se le haya perdido el objeto.</FieldDescription>
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
                        filtro={ filtroTodasEtiquetas }
                        invalido={fieldState.invalid}
                      />
                      <FieldDescription>Elija una o más etiquetas que describan el objeto.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              onClick={() => navigate('/menuBusqueda/alertaBusqueda')}
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
              {formulario.formState.isSubmitting ? 'Registrando...' : (esEdicion ? 'Editar alerta' : 'Crear alerta')}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
