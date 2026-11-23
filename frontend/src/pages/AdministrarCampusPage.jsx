import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOutletContext } from 'react-router-dom';
import { MapPinIcon, PenIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResponsiveModal } from '../components/ui/responsive-modal.jsx';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useNotify } from '../hooks/useNotify.js';
import * as campusService from '../services/campusService.js';
import { CampusSchema } from '../schemas/campus.schema.js';

const ID_FORMULARIO = 'form-campus';

/**
 * Formulario de crear/editar. Vive dentro del modal, por lo que se monta de cero
 * cada vez que el modal se abre y parte con los valores del campus a editar.
 *
 * @param {{campus: {id: number, nombre: string, direccion: string}|null, onGuardado: () => void, onCancelar: () => void}} props
 */
function FormularioCampus({ campus, onGuardado, onCancelar }) {
  const esEdicion = Boolean(campus);
  const [apiError, setApiError] = useState(null);

  const formulario = useForm({
    resolver: zodResolver(CampusSchema),
    defaultValues: {
      nombre: campus?.nombre ?? '',
      direccion: campus?.direccion ?? ''
    }
  });

  async function onSubmit(datos) {
    setApiError(null);
    try {
      if (esEdicion)
        await campusService.actualizar(campus.id, datos);
      else
        await campusService.crear(datos);
      onGuardado();
    } catch (err) {
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      setApiError(err.message);
    }
  }

  const enviando = formulario.formState.isSubmitting;

  return (
    <form
      id={ID_FORMULARIO}
      onSubmit={formulario.handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 p-4 sm:p-0"
    >
      {apiError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo {esEdicion ? 'editar' : 'crear'} el campus</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="space-y-4">
        <Controller
          name="nombre"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="campus-nombre">Nombre</FieldLabel>
              <Input
                {...field}
                id="campus-nombre"
                aria-invalid={fieldState.invalid}
                placeholder="Campus Fernando May"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="direccion"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="campus-direccion">Dirección</FieldLabel>
              <Input
                {...field}
                id="campus-direccion"
                aria-invalid={fieldState.invalid}
                placeholder="Av. Andrés Bello 720, Chillán"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando
            ? esEdicion ? 'Guardando cambios...' : 'Creando campus...'
            : esEdicion ? 'Guardar cambios' : 'Crear campus'}
        </Button>
      </div>
    </form>
  );
}

export default function AdministrarCampusPage() {
  const { campusSeleccionado, setCampusSeleccionado } = useOutletContext();
  const campus = useFetch(campusService.listar, [], []);
  const notificacion = useNotify();

  // modal de crear/editar: campus null = crear
  const [modal, setModal] = useState({ abierto: false, campus: null });

  // dialogo de eliminar: el motivo del rechazo (409) se muestra dentro del mismo dialogo
  // se conserva el campus aunque se cierre, para que no se vacie el texto durante la animacion
  const [campusAEliminar, setCampusAEliminar] = useState(null);
  const [eliminarAbierto, setEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  function abrirModal(campusEditado = null) {
    setModal({ abierto: true, campus: campusEditado });
  }

  function cerrarModal() {
    setModal((anterior) => ({ ...anterior, abierto: false }));
  }

  function onGuardado() {
    const esEdicion = Boolean(modal.campus);
    notificacion.exito(esEdicion ? 'Campus editado correctamente' : 'Campus creado correctamente');
    cerrarModal();
    campus.recargar();
  }

  function abrirEliminar(campusEliminado) {
    setErrorEliminar(null);
    setCampusAEliminar(campusEliminado);
    setEliminarAbierto(true);
  }

  function cambiarAbiertoEliminar(abierto) {
    // no se puede cerrar mientras se esta eliminando
    if (!abierto && !eliminando)
      setEliminarAbierto(false);
  }

  async function confirmarEliminar() {
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await campusService.eliminar(campusAEliminar.id);
      notificacion.exito(`Se eliminó el campus ${campusAEliminar.nombre}`);
      // si era el campus elegido en el selector del menu, se limpia
      if (campusSeleccionado === campusAEliminar.id)
        setCampusSeleccionado(null);
      setEliminarAbierto(false);
      campus.recargar();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el campus');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus de la universidad</h1>
          <p className="text-sm text-muted-foreground">Administre los campus donde se ubican las oficinas.</p>
        </div>
        <Button onClick={() => abrirModal()}>
          <PlusIcon /> Crear campus
        </Button>
      </header>

      {campus.cargando ? (
        <div className="align-middle justify-items-center">
          <ItemCargando className="max-w-100" texto="Cargando campus..." />
        </div>
      ) : campus.error ? (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar el listado de campus</AlertTitle>
            <AlertDescription>{campus.error.mensaje}</AlertDescription>
          </Alert>
        </div>
      ) : campus.datos.length > 0 ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {campus.datos.map((item) => (
            <Card key={item.id} size="default" className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold leading-tight">{item.nombre}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-muted-foreground flex-1">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{item.direccion || 'Sin dirección registrada'}</span>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => abrirModal(item)}>
                  <PenIcon />Editar
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => abrirEliminar(item)}>
                  <Trash2Icon />Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="align-middle justify-items-center">
          <ItemSinDatos className="max-w-100" titulo="No hay campus" descripcion="Cree el primer campus de la universidad" />
        </div>
      )}

      <ResponsiveModal
        open={modal.abierto}
        onOpenChange={(abierto) => (abierto ? setModal({ ...modal, abierto }) : cerrarModal())}
        title={modal.campus ? 'Editar campus' : 'Crear campus'}
        description={
          modal.campus
            ? 'Actualice el nombre y la dirección del campus.'
            : 'Ingrese el nombre y la dirección del nuevo campus.'
        }
      >
        <FormularioCampus
          campus={modal.campus}
          onGuardado={onGuardado}
          onCancelar={cerrarModal}
        />
      </ResponsiveModal>

      <AlertDialog open={eliminarAbierto} onOpenChange={cambiarAbiertoEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Eliminar campus</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar el campus {campusAEliminar?.nombre}? Solo se puede
              eliminar si no tiene oficinas asociadas y no podrá recuperarse.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {errorEliminar && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo eliminar el campus</AlertTitle>
              <AlertDescription>{errorEliminar}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmarEliminar} disabled={eliminando}>
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
