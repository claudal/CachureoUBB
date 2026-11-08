import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import * as encargadoOficinaService from '../services/encargadoOficinaService.js'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { useNotify } from '../hooks/useNotify.js';
import Selector from '../components/Selector.jsx';
import { listar, listarOficinas } from '../services/campusService.js';
import { CrearEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';
import { formatear } from '../utils/rut.utils.js';

const ID_FORMULARIO = 'form-crear-encargado';

export default function CrearEncargadoPage() {
  const navigate = useNavigate();
  const { campusSeleccionado } = useOutletContext();
  const [campus,setCampus] = useState(null);

  useEffect(()=>setCampus(campusSeleccionado),[campusSeleccionado]);

  const notification = useNotify();

  const { id } = useParams();
  const esEdicion = Boolean(id);
  const [apiError, setApiError] = useState(null);
  const [cargando, setCargando] = useState(esEdicion); //TODO: modo edición

  const formulario = useForm({
    resolver: zodResolver(CrearEncargadoOficinaSchema),
    defaultValues: {
      correoContacto: "",
      nombre: "",
      rut: "",
      idOficina: ""
    }
  });

  /*useEffect(() => { //TODO: modo edición
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
  }, [esEdicion]);*/

  async function onSubmit(datos) {
    setApiError(null);
    try {
      if(esEdicion) { //TODO: modo edición
        await encargadoOficinaService.actualizar(id,datos);
        notification.exito(`Alerta editada correctamente`);
        
      } else {
        const resultado = await encargadoOficinaService.crear(datos);
        notification.exito(`Encargado de oficina creado correctamente`);
        if(!resultado.correoEnviado)
          notification.error(`Hubo un error al enviar el correo de creación. Vuelva a reenviarle el correo más tarde.`);
      }
      navigate("/menuAdministrador")
    } catch (err) {
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      if(err.status === 409){
        setApiError(`Ya existe un encargado con el rut ${formatear(datos.rut)}`);
      } else
        setApiError(err.message);
    }
  }


  return (
    <div className="mx-auto w-full max-w-2xl p-4 pb-28">
      <Button
        variant="ghost"
        className="mb-2"
        onClick={() => navigate('/menuAdministrador')}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver al menú de encargados
      </Button>

      {cargando ? (
        <ItemCargando texto="Cargando datos del encargado..." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {esEdicion ? 'Editar encargado de oficina' : 'Crear encargado de oficina'}
            </CardTitle>
            <CardDescription>
              {esEdicion
                ? 'Actualice la información general y la oficina asignada para este encargado.'
                : 'Complete el formulario para registrar un nuevo encargado y asignarle una oficina.'}
            </CardDescription>

            {apiError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>
                  No se pudo {esEdicion ? 'editar' : 'crear'} el encargado
                </AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            <form
              id={ID_FORMULARIO}
              onSubmit={formulario.handleSubmit(onSubmit)}
              noValidate
              className="space-y-6"
            >
              <FieldGroup className="space-y-4">
                <Controller
                  name="rut"
                  control={formulario.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="encargado-rut">RUT</FieldLabel>
                      <Input
                        {...field}
                        id="encargado-rut"
                        aria-invalid={fieldState.invalid}
                        placeholder="11.111.111-1"
                        autoComplete="off"
                        autoCorrect="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="nombre"
                  control={formulario.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="encargado-nombre">Nombre completo</FieldLabel>
                      <Input
                        {...field}
                        id="encargado-nombre"
                        aria-invalid={fieldState.invalid}
                        placeholder="Gerundio Peralta Pérez"
                        autoComplete="name"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="correoContacto"
                  control={formulario.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="encargado-correoContacto">
                        Correo de contacto
                      </FieldLabel>
                      <Input
                        {...field}
                        type="email"
                        id="encargado-correoContacto"
                        aria-invalid={fieldState.invalid}
                        placeholder="correo@dominio.com"
                        autoComplete="email"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <FieldGroup className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
                <Field>
                  <FieldLabel htmlFor="filtro-campus">Campus</FieldLabel>
                  <Selector
                    id="filtro-campus"
                    onSelect={(nuevoCampus) => {
                      setCampus(nuevoCampus);
                      formulario.setValue('idOficina', null, { shouldValidate: true });
                    }}
                    value={campus}
                    fn={listar}
                    textoCargando="Cargando campus..."
                    textoNoDatos="No se encontraron campus"
                    textoVacio="Seleccione un campus"
                  />
                  <FieldDescription className="text-xs text-muted-foreground mt-1">
                    Filtre las oficinas seleccionando el campus correspondiente.
                  </FieldDescription>
                </Field>

                <Controller
                  name="idOficina"
                  control={formulario.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="selector-oficina">
                        Oficina asignada
                      </FieldLabel>
                      <Selector
                        {...field}
                        id="selector-oficina"
                        fn={() => listarOficinas(campus)}
                        deps={[campus]}
                        disabled={!campus}
                        onBlur={field.onBlur}
                        onSelect={field.onChange}
                        value={field.value}
                        invalid={fieldState.invalid}
                        textoCargando="Cargando oficinas..."
                        textoNoDatos="No hay oficinas disponibles en este campus"
                        textoVacio={
                          campus ? 'Seleccione una oficina' : 'Primero elija un campus'
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
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
              onClick={() => navigate('/menuAdministrador')}
              disabled={formulario.formState.isSubmitting}
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
              {formulario.formState.isSubmitting
                ? esEdicion
                  ? 'Guardando cambios...'
                  : 'Creando encargado...'
                : esEdicion
                ? 'Guardar cambios'
                : 'Crear encargado'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
