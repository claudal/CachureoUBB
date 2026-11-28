import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOutletContext } from 'react-router-dom';
import { BuildingIcon, ImageOffIcon, MapPinIcon, PenIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import VisorImagen from '../components/ui/visor-imagen.jsx';
import Selector from '../components/Selector.jsx';
import CargaImagenes from '../components/CargaImagenes.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useNotify } from '../hooks/useNotify.js';
import * as oficinaService from '../services/oficinaService.js';
import * as campusService from '../services/campusService.js';
import { OficinaSchema, MAXIMO_FOTOS_OFICINA } from '../schemas/oficina.schema.js';
import { urlFoto } from '../utils/foto.utils.js';

const ID_FORMULARIO = 'form-oficina';

/**
 * Foto de la tarjeta. Si no carga (o la oficina no tiene), muestra un recuadro de reemplazo.
 *
 * @param {{oficina: {nombre: string, fotos: {url: string}[]}, onAbrir: (foto: {url: string, nombre: string}) => void}} props
 */
function FotoOficina({ oficina, onAbrir }) {
  const [fallo, setFallo] = useState(false);
  const foto = oficina.fotos[0];

  if (!foto || fallo)
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
        <ImageOffIcon className="size-6" />
        <span className="text-xs">Sin foto disponible</span>
      </div>
    );

  return (
    <img
      src={urlFoto(foto.url)}
      alt={`Foto de la oficina ${oficina.nombre}`}
      className="aspect-video w-full cursor-pointer object-cover"
      onError={() => setFallo(true)}
      onClick={() => onAbrir({ url: foto.url, nombre: oficina.nombre })}
    />
  );
}

/**
 * Formulario de crear/editar. Vive dentro del modal, por lo que se monta de cero
 * cada vez que el modal se abre y parte con los valores de la oficina a editar.
 *
 * @param {{oficina: object|null, onGuardado: () => void, onCancelar: () => void}} props
 */
function FormularioOficina({ oficina, onGuardado, onCancelar }) {
  const esEdicion = Boolean(oficina);
  const [apiError, setApiError] = useState(null);

  const formulario = useForm({
    resolver: zodResolver(OficinaSchema),
    defaultValues: {
      nombre: oficina?.nombre ?? '',
      descripcion: oficina?.descripcion ?? '',
      idCampus: oficina?.idCampus ?? null,
      // las oficinas pueden tener mas de una foto (datos antiguos), el formulario maneja solo la primera
      fotos: oficina?.fotos.slice(0, MAXIMO_FOTOS_OFICINA) ?? []
    }
  });

  async function onSubmit(datos) {
    setApiError(null);
    try {
      if (esEdicion)
        await oficinaService.actualizar(oficina.id, datos);
      else
        await oficinaService.crear(datos);
      onGuardado();
    } catch (err) {
      err.detalles?.forEach(({ campo, mensaje }) => {
        // en el servidor el campo de la foto se llama "foto" y en el formulario "fotos"
        const nombreCampo = campo === 'foto' ? 'fotos' : campo;
        if (nombreCampo in formulario.getValues())
          formulario.setError(nombreCampo, { message: mensaje });
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
      className="max-h-[70vh] space-y-4 overflow-y-auto p-4 sm:p-1"
    >
      {apiError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo {esEdicion ? 'editar' : 'crear'} la oficina</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="space-y-4">
        <Controller
          name="nombre"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="oficina-nombre">Nombre</FieldLabel>
              <Input
                {...field}
                id="oficina-nombre"
                aria-invalid={fieldState.invalid}
                placeholder="Oficina de Objetos Perdidos - Biblioteca"
                autoComplete="off"
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
              <FieldLabel htmlFor="oficina-descripcion">Descripción</FieldLabel>
              <Textarea
                {...field}
                id="oficina-descripcion"
                aria-invalid={fieldState.invalid}
                placeholder="Primer piso, junto al mesón de atención"
                rows={3}
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
              <FieldLabel htmlFor="oficina-campus">Campus</FieldLabel>
              <Selector
                id="oficina-campus"
                value={field.value}
                onSelect={field.onChange}
                invalid={fieldState.invalid}
                fn={campusService.listar}
                textoCargando="Cargando listado de campus..."
                textoNoDatos="No hay campus"
                textoVacio="Seleccione un campus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="fotos"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <CargaImagenes
              field={field}
              fieldState={fieldState}
              max={MAXIMO_FOTOS_OFICINA}
              id="oficina-foto"
              etiqueta="Foto de la oficina"
              descripcion="Una foto del lugar. JPG, PNG, WEBP o HEIC, de hasta 5 MB."
            />
          )}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando
            ? esEdicion ? 'Guardando cambios...' : 'Creando oficina...'
            : esEdicion ? 'Guardar cambios' : 'Crear oficina'}
        </Button>
      </div>
    </form>
  );
}

export default function AdministrarOficinasPage() {
  // el campus elegido en el selector es el mismo que usan las demas secciones del menu
  const { campusSeleccionado, setCampusSeleccionado } = useOutletContext();
  const oficinas = useFetch(
    () => oficinaService.listar({ idCampus: campusSeleccionado }),
    [campusSeleccionado],
    []
  );
  const notificacion = useNotify();

  // modal de crear/editar: oficina null = crear
  const [modal, setModal] = useState({ abierto: false, oficina: null });

  // dialogo de eliminar: el motivo del rechazo (409) se muestra dentro del mismo dialogo
  // se conserva la oficina aunque se cierre, para que no se vacie el texto durante la animacion
  const [oficinaAEliminar, setOficinaAEliminar] = useState(null);
  const [eliminarAbierto, setEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  // foto ampliada
  const [fotoAbierta, setFotoAbierta] = useState(null);

  function abrirModal(oficinaEditada = null) {
    setModal({ abierto: true, oficina: oficinaEditada });
  }

  function cerrarModal() {
    setModal((anterior) => ({ ...anterior, abierto: false }));
  }

  function onGuardado() {
    const esEdicion = Boolean(modal.oficina);
    notificacion.exito(esEdicion ? 'Oficina editada correctamente' : 'Oficina creada correctamente');
    cerrarModal();
    oficinas.recargar();
  }

  function abrirEliminar(oficinaEliminada) {
    setErrorEliminar(null);
    setOficinaAEliminar(oficinaEliminada);
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
      await oficinaService.eliminar(oficinaAEliminar.id);
      notificacion.exito(`Se eliminó la oficina ${oficinaAEliminar.nombre}`);
      setEliminarAbierto(false);
      oficinas.recargar();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar la oficina');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div>
      <VisorImagen url={fotoAbierta?.url} nombre={fotoAbierta?.nombre} onOpenChange={() => setFotoAbierta(null)} />

      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Oficinas de la universidad</h1>
          <p className="text-sm text-muted-foreground">Administre las oficinas donde se guardan los objetos perdidos.</p>
        </div>
        <Selector
          onSelect={setCampusSeleccionado}
          value={campusSeleccionado}
          fn={campusService.listar}
          textoCargando="Cargando listado de campus..."
          textoNoDatos="No hay campus"
          textoVacio="Filtrar por campus"
        />
        <Button onClick={() => abrirModal()}>
          <PlusIcon /> Crear oficina
        </Button>
      </header>

      {oficinas.cargando ? (
        <div className="align-middle justify-items-center">
          <ItemCargando className="max-w-100" texto="Cargando oficinas..." />
        </div>
      ) : oficinas.error ? (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar el listado de oficinas</AlertTitle>
            <AlertDescription>{oficinas.error.mensaje}</AlertDescription>
          </Alert>
        </div>
      ) : oficinas.datos.length > 0 ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {oficinas.datos.map((item) => (
            <Card key={item.id} size="default" className="flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md">
              <FotoOficina oficina={item} onAbrir={setFotoAbierta} />

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold leading-tight">{item.nombre}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item.campus?.nombre}</span>
                </div>
                <div className="flex items-start gap-2">
                  <BuildingIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="line-clamp-3">{item.descripcion || 'Sin descripción'}</span>
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
          <ItemSinDatos
            className="max-w-100"
            titulo="No hay oficinas"
            descripcion={campusSeleccionado ? 'Este campus aún no tiene oficinas' : 'Cree la primera oficina de la universidad'}
          />
        </div>
      )}

      <ResponsiveModal
        open={modal.abierto}
        onOpenChange={(abierto) => (abierto ? setModal({ ...modal, abierto }) : cerrarModal())}
        title={modal.oficina ? 'Editar oficina' : 'Crear oficina'}
        description={
          modal.oficina
            ? 'Actualice los datos de la oficina. Si no cambia la foto, se conserva la actual.'
            : 'Ingrese los datos de la nueva oficina y una foto del lugar.'
        }
      >
        <FormularioOficina
          oficina={modal.oficina}
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
            <AlertDialogTitle>Eliminar oficina</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar la oficina {oficinaAEliminar?.nombre}? Solo se puede
              eliminar si no tiene encargados ni objetos perdidos asociados y no podrá recuperarse.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {errorEliminar && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo eliminar la oficina</AlertTitle>
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
