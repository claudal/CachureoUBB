import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BuildingIcon, GhostIcon, IdCardIcon, MailIcon, PenIcon, PlusIcon, RotateCwClockIcon, SearchIcon, SendIcon, SmileIcon, Trash2Icon, UserMinusIcon, UserPlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { Paginacion } from '../components/ui/paginacion.jsx';
import { PanelFiltro, usePanelFiltro } from '../components/PanelFiltros.jsx';
import Selector from '../components/Selector.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useNotify } from '../hooks/useNotify.js';
import * as encargadoOficinaService from '../services/encargadoOficinaService.js';
import * as campusService from '../services/campusService.js';
import * as oficinaService from '../services/oficinaService.js';
import { EditarEncargadoOficinaSchema, FiltroEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';
import { formatear } from '../utils/rut.utils.js';

const CANTIDAD_POR_PAGINA = 15;

const FILTRO_DEFECTO = {
  nombre: '',
  rut: '',
  idOficina: null
};

const ESTADO = {
  HABILITADO: 1,
  PENDIENTE: 2,
  DESHABILITADO: 3
};

const INSIGNIAS_ESTADO = {
  [ESTADO.HABILITADO]: { variante: 'outline', Icono: SmileIcon },
  [ESTADO.PENDIENTE]: { variante: 'outline', Icono: RotateCwClockIcon },
  [ESTADO.DESHABILITADO]: { variante: 'destructive', Icono: GhostIcon }
};

// textos y llamada al servidor de cada accion que requiere confirmacion
const ACCIONES = {
  eliminar: {
    Icono: Trash2Icon,
    variante: 'destructive',
    titulo: 'Eliminar encargado',
    pregunta: (nombre) => `¿Está seguro de que desea eliminar a ${nombre}? Solo se puede eliminar si no tiene entregas de objetos asociadas y no podrá recuperarse.`,
    boton: 'Eliminar',
    botonEnviando: 'Eliminando...',
    tituloError: 'No se pudo eliminar al encargado',
    exito: (nombre) => `Se eliminó al encargado ${nombre}`,
    ejecutar: (rut) => encargadoOficinaService.eliminar(rut)
  },
  deshabilitar: {
    Icono: UserMinusIcon,
    variante: 'destructive',
    titulo: 'Deshabilitar encargado',
    pregunta: (nombre) => `¿Desea deshabilitar a ${nombre}? No podrá iniciar sesión hasta que lo vuelva a habilitar.`,
    boton: 'Deshabilitar',
    botonEnviando: 'Deshabilitando...',
    tituloError: 'No se pudo deshabilitar al encargado',
    exito: (nombre) => `Se deshabilitó a ${nombre}`,
    ejecutar: (rut) => encargadoOficinaService.cambiarEstado(rut, ESTADO.DESHABILITADO)
  },
  habilitar: {
    Icono: UserPlusIcon,
    variante: 'default',
    titulo: 'Habilitar encargado',
    pregunta: (nombre) => `¿Desea habilitar a ${nombre}? Podrá volver a iniciar sesión.`,
    boton: 'Habilitar',
    botonEnviando: 'Habilitando...',
    tituloError: 'No se pudo habilitar al encargado',
    exito: (nombre) => `Se habilitó a ${nombre}`,
    ejecutar: (rut) => encargadoOficinaService.cambiarEstado(rut, ESTADO.HABILITADO)
  }
};

/**
 * Oficinas para el filtro. Se agrega el campus al nombre porque pueden repetirse entre sedes.
 *
 * @param {number|null} idCampus
 */
async function listarOficinasFiltro(idCampus) {
  const oficinas = await oficinaService.listar({ idCampus });
  if (idCampus)
    return oficinas;
  return oficinas.map((oficina) => ({ ...oficina, nombre: `${oficina.nombre} (${oficina.campus?.nombre})` }));
}

/**
 * Formulario de edicion. Vive dentro del modal, por lo que se monta de cero
 * cada vez que el modal se abre y parte con los valores del encargado.
 *
 * @param {{encargado: object, onGuardado: () => void, onCancelar: () => void}} props
 */
function FormularioEncargado({ encargado, onGuardado, onCancelar }) {
  const [apiError, setApiError] = useState(null);
  // la sede solo sirve para acotar las oficinas, no se guarda en el encargado
  const [campus, setCampus] = useState(encargado.oficina?.idCampus ?? null);

  const formulario = useForm({
    resolver: zodResolver(EditarEncargadoOficinaSchema),
    defaultValues: {
      correoContacto: encargado.correoContacto ?? '',
      idOficina: encargado.idOficina ?? null
    }
  });

  async function onSubmit(datos) {
    setApiError(null);
    try {
      await encargadoOficinaService.actualizar(encargado.rut, datos);
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
      onSubmit={formulario.handleSubmit(onSubmit)}
      noValidate
      className="max-h-[70vh] space-y-4 overflow-y-auto p-4 sm:p-1"
    >
      {apiError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo editar el encargado</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="space-y-4">
        <Controller
          name="correoContacto"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="editar-correo">Correo de contacto</FieldLabel>
              <Input
                {...field}
                type="email"
                id="editar-correo"
                aria-invalid={fieldState.invalid}
                placeholder="correo@dominio.com"
                autoComplete="off"
              />
              {encargado.idEstado === ESTADO.PENDIENTE && (
                <FieldDescription>
                  Si cambia el correo, use "Reenviar correo de creación" para que le llegue a la nueva dirección.
                </FieldDescription>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor="editar-campus">Campus</FieldLabel>
          <Selector
            id="editar-campus"
            value={campus}
            onSelect={(nuevoCampus) => {
              setCampus(nuevoCampus);
              formulario.setValue('idOficina', null);
            }}
            fn={campusService.listar}
            textoCargando="Cargando listado de campus..."
            textoNoDatos="No hay campus"
            textoVacio="Seleccione un campus"
          />
        </Field>

        <Controller
          name="idOficina"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="editar-oficina">Oficina asignada</FieldLabel>
              <Selector
                id="editar-oficina"
                value={field.value}
                onSelect={field.onChange}
                invalid={fieldState.invalid}
                fn={() => campusService.listarOficinas(campus)}
                deps={[campus]}
                disabled={!campus}
                textoCargando="Cargando oficinas..."
                textoNoDatos="No hay oficinas disponibles en este campus"
                textoVacio={campus ? 'Seleccione una oficina' : 'Primero elija un campus'}
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
          {enviando ? 'Guardando cambios...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

export default function AdministrarEncargadosPage() {
  // el campus elegido en el selector es el mismo que usan las demas secciones del menu
  const { campusSeleccionado, setCampusSeleccionado } = useOutletContext();
  const navigate = useNavigate();
  const notificacion = useNotify();

  const [filtros, setFiltros] = useState(FILTRO_DEFECTO);
  const [salto, setSalto] = useState(0);
  const encargados = useFetch(
    () => encargadoOficinaService.listar({
      ...filtros,
      idCampus: campusSeleccionado,
      salto,
      cantidad: CANTIDAD_POR_PAGINA
    }),
    [filtros, campusSeleccionado, salto],
    []
  );

  const controladorFiltro = usePanelFiltro(
    FILTRO_DEFECTO,
    (datos) => {
      setFiltros(datos);
      setSalto(0);
    },
    { resolver: zodResolver(FiltroEncargadoOficinaSchema) }
  );
  const hayFiltros = Boolean(filtros.nombre || filtros.rut || filtros.idOficina);

  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  // modal de edicion
  // se conserva el encargado aunque se cierre, para que no se vacie el texto durante la animacion
  const [encargadoEditado, setEncargadoEditado] = useState(null);
  const [editarAbierto, setEditarAbierto] = useState(false);

  // dialogo de confirmacion: el motivo del rechazo (409) se muestra dentro del mismo dialogo
  const [confirmacion, setConfirmacion] = useState({ tipo: 'eliminar', encargado: null });
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmacion, setErrorConfirmacion] = useState(null);
  const accion = ACCIONES[confirmacion.tipo];

  function onCambiarCampus(idCampus) {
    setCampusSeleccionado(idCampus);
    setSalto(0);
    // la oficina filtrada puede no pertenecer al nuevo campus
    controladorFiltro.formulario.setValue('idOficina', null);
    setFiltros((anteriores) => ({ ...anteriores, idOficina: null }));
  }

  function limpiarFiltros() {
    controladorFiltro.formulario.reset(FILTRO_DEFECTO);
    setFiltros(FILTRO_DEFECTO);
    setSalto(0);
  }

  async function onReenviarCorreo(encargado) {
    setEnviandoCorreo(true);
    try {
      await encargadoOficinaService.reenviarCorreoCreacion(encargado.rut);
      notificacion.exito('Se reenvió el correo de creación exitosamente');
      // oculta el boton para no reenviar varias veces seguidas
      encargados.setDatos((lista) => lista.map((item) => (
        item.rut === encargado.rut ? { ...item, correoReenviado: true } : item
      )));
    } catch {
      notificacion.error('Hubo un error al reenviar el correo de creación. Inténtelo más tarde.');
    } finally {
      setEnviandoCorreo(false);
    }
  }

  function onEditar(encargado) {
    setEncargadoEditado(encargado);
    setEditarAbierto(true);
  }

  function onGuardado() {
    notificacion.exito('Encargado editado correctamente');
    setEditarAbierto(false);
    encargados.recargar();
  }

  function pedirConfirmacion(tipo, encargado) {
    setErrorConfirmacion(null);
    setConfirmacion({ tipo, encargado });
    setConfirmacionAbierta(true);
  }

  function cambiarAbiertoConfirmacion(abierto) {
    // no se puede cerrar mientras se esta ejecutando la accion
    if (!abierto && !confirmando)
      setConfirmacionAbierta(false);
  }

  async function confirmar() {
    const { rut, nombre } = confirmacion.encargado;
    setConfirmando(true);
    setErrorConfirmacion(null);
    try {
      await accion.ejecutar(rut);
      notificacion.exito(accion.exito(nombre));
      setConfirmacionAbierta(false);
      // si se elimino el unico encargado de la pagina, se vuelve a la anterior
      if (confirmacion.tipo === 'eliminar' && encargados.datos.length === 1 && salto > 0)
        setSalto(salto - CANTIDAD_POR_PAGINA);
      else
        encargados.recargar();
    } catch (err) {
      setErrorConfirmacion(err.message || accion.tituloError);
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div>
      <PanelFiltro controlador={controladorFiltro}>
        <FieldGroup className="space-y-4">
          <Controller
            name="nombre"
            control={controladorFiltro.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="filtro-nombre">Nombre</FieldLabel>
                <Input
                  {...field}
                  id="filtro-nombre"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nombre o parte del nombre"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="rut"
            control={controladorFiltro.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="filtro-rut">RUT</FieldLabel>
                <Input
                  {...field}
                  id="filtro-rut"
                  aria-invalid={fieldState.invalid}
                  placeholder="11.111.111-1"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="idOficina"
            control={controladorFiltro.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="filtro-oficina">Oficina asignada</FieldLabel>
                <Selector
                  id="filtro-oficina"
                  value={field.value}
                  onSelect={field.onChange}
                  fn={() => listarOficinasFiltro(campusSeleccionado)}
                  deps={[campusSeleccionado]}
                  textoCargando="Cargando oficinas..."
                  textoNoDatos="No hay oficinas"
                  textoVacio="Todas las oficinas"
                />
                <FieldDescription>
                  Para filtrar por sede, use el selector de campus del listado.
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </PanelFiltro>

      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Encargados de oficina</h1>
          <p className="text-sm text-muted-foreground">Administre los encargados de oficina de la universidad.</p>
        </div>
        <Selector
          onSelect={onCambiarCampus}
          value={campusSeleccionado}
          fn={campusService.listar}
          textoCargando="Cargando listado de campus..."
          textoNoDatos="No hay campus"
          textoVacio="Filtrar por campus"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          {hayFiltros && (
            <Button variant="ghost" onClick={limpiarFiltros}>
              <XIcon />Limpiar filtros
            </Button>
          )}
          <Button variant="outline" onClick={() => controladorFiltro.setAbierto(true)}>
            <SearchIcon />Abrir filtros
          </Button>
          <Button onClick={() => navigate('crearEncargado')}>
            <PlusIcon /> Crear encargado de oficina
          </Button>
        </div>
      </header>

      {encargados.cargando ? (
        <div className="align-middle justify-items-center">
          <ItemCargando className="max-w-100" texto="Cargando encargados de oficina..." />
        </div>
      ) : encargados.error ? (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar el listado de encargados</AlertTitle>
            <AlertDescription>{encargados.error.mensaje}</AlertDescription>
          </Alert>
        </div>
      ) : encargados.datos.length > 0 ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {encargados.datos.map((encargado) => {
            const { variante, Icono } = INSIGNIAS_ESTADO[encargado.idEstado];
            return (
              <Card key={encargado.rut} size="default" className="flex flex-col justify-between transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight">
                      {encargado.nombre}
                    </CardTitle>
                    <Badge variant={variante} className="flex shrink-0 items-center gap-1">
                      <Icono className="h-3.5 w-3.5" />
                      <span>{encargado.estado.nombre}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <IdCardIcon className="h-4 w-4 shrink-0" />
                    <span>{formatear(encargado.rut)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{encargado.correoContacto || 'Sin correo registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 shrink-0" />
                    <span>{encargado.oficina?.nombre}</span>
                  </div>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => onEditar(encargado)}>
                    <PenIcon />Editar
                  </Button>
                  {encargado.idEstado === ESTADO.PENDIENTE && !encargado.correoReenviado && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => onReenviarCorreo(encargado)}
                      disabled={enviandoCorreo}
                    >
                      <SendIcon />Reenviar correo de creación
                    </Button>
                  )}
                  {encargado.idEstado === ESTADO.HABILITADO && (
                    <Button variant="secondary" className="w-full" onClick={() => pedirConfirmacion('deshabilitar', encargado)}>
                      <UserMinusIcon />Deshabilitar
                    </Button>
                  )}
                  {encargado.idEstado === ESTADO.DESHABILITADO && (
                    <Button className="w-full" onClick={() => pedirConfirmacion('habilitar', encargado)}>
                      <UserPlusIcon />Habilitar
                    </Button>
                  )}
                  <Button variant="destructive" className="w-full" onClick={() => pedirConfirmacion('eliminar', encargado)}>
                    <Trash2Icon />Eliminar
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="align-middle justify-items-center">
          <ItemSinDatos
            className="max-w-100"
            titulo="No hay encargados"
            descripcion={
              hayFiltros || campusSeleccionado || salto > 0
                ? 'Ningún encargado coincide con la búsqueda'
                : 'Cree el primer encargado de oficina'
            }
          />
        </div>
      )}

      <div className="align-middle justify-items-center py-6 pb-24">
        <Paginacion
          disabledBack={encargados.cargando || salto === 0}
          onBack={() => setSalto(salto - CANTIDAD_POR_PAGINA)}
          disabledFoward={encargados.cargando || encargados.datos.length < CANTIDAD_POR_PAGINA}
          onFoward={() => setSalto(salto + CANTIDAD_POR_PAGINA)}
        />
      </div>

      <ResponsiveModal
        open={editarAbierto}
        onOpenChange={setEditarAbierto}
        title="Editar encargado"
        description={
          encargadoEditado && `${encargadoEditado.nombre} · ${formatear(encargadoEditado.rut)}`
        }
      >
        {encargadoEditado && (
          <FormularioEncargado
            key={encargadoEditado.rut}
            encargado={encargadoEditado}
            onGuardado={onGuardado}
            onCancelar={() => setEditarAbierto(false)}
          />
        )}
      </ResponsiveModal>

      <AlertDialog open={confirmacionAbierta} onOpenChange={cambiarAbiertoConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={accion.variante === 'destructive' ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive' : undefined}>
              <accion.Icono />
            </AlertDialogMedia>
            <AlertDialogTitle>{accion.titulo}</AlertDialogTitle>
            <AlertDialogDescription>
              {accion.pregunta(confirmacion.encargado?.nombre)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {errorConfirmacion && (
            <Alert variant="destructive">
              <AlertTitle>{accion.tituloError}</AlertTitle>
              <AlertDescription>{errorConfirmacion}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={confirmando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={accion.variante} onClick={confirmar} disabled={confirmando}>
              {confirmando ? accion.botonEnviando : accion.boton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
