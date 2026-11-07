import * as encargadoOficinaService from '../services/encargadoOficinaService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AlertCircle, AlertCircleIcon, ArrowRightCircleIcon, BookmarkIcon, EyeIcon, PlusIcon, SearchIcon, SendHorizontalIcon } from 'lucide-react';

import SelectorEtiquetasObjeto from '../components/SelectorEtiquetasObjeto.jsx';
import CarruselImagenes from '../components/CarruselImagenes.jsx';

import { FieldError, FieldGroup, Field, FieldLabel, FieldDescription } from "../components/ui/field.js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import { Toggle } from '../components/ui/toggle.js'
import { Button } from '../components/ui/button.js'
import { Input } from '../components/ui/input.js';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer.js';
import { PanelFiltro, usePanelFiltro } from '../components/PanelFiltros.jsx';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert.js';
import { useNotify } from '../hooks/useNotify.js';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrearSolicitudDetallesSchema } from '../schemas/alertaBusqueda.schema.js';
import { crearReunionSchema } from '../../../backend/src/schemas/alertaBusqueda.schema.js';
import { useOutletContext } from 'react-router-dom';
import Selector from '../components/Selector.jsx';
import { listar, listarOficinas } from '../services/campusService.js';
import { ButtonGroup } from '../components/ui/button-group.js';
import { CrearEncargadoOficinaSchema } from '../schemas/encargadoOficina.schema.js';
import { ResponsiveModal } from '../components/ui/responsive-modal.jsx';

const filtroDefecto = {
  idEstado: 1
}

//TODO: crear modo edición
function FormularioEncargado({encargadoId=null,onSend,open,onOpenChange}) {
  const { campusSeleccionado } = useOutletContext();
  const [campus,setCampus] = useState(null);

  useEffect(()=>setCampus(campusSeleccionado),[campusSeleccionado]);

  const notification = useNotify();

  const esEdicion = Boolean(encargadoId);
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
        await encargadoOficinaService.crear(datos);
        notification.exito(`Encargado de oficina creado correctamente`);
      }

      onSend();
    } catch (err) {
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      setApiError(err.message);
    }
  }

  

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Crear encargado de oficina"
      closeButton={
        <Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>
      }
      drawerProps={{"swipeDirection": "left"}}
      footer={(<Button
            type="submit"
            form="form-encargado"
            size="lg"
            className="w-full sm:w-auto"
            disabled={formulario.formState.isSubmitting}
          >
            {formulario.formState.isSubmitting ? 'Creando...' : 'Crear encargado de oficina'}<SendHorizontalIcon />
          </Button>)}
    >
      <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {apiError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>No se pudo crear el encargado</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        <form id="form-encargado" onSubmit={formulario.handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Sección 1: Datos Personales del Encargado */}
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {/* Campo RUT */}
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Campo Nombre Completo */}
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Campo Correo de Contacto (Ocupa ancho completo en grid) */}
            <div className="sm:col-span-2">
              <Controller
                name="correoContacto"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="encargado-correoContacto">Correo de contacto</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      id="encargado-correoContacto"
                      aria-invalid={fieldState.invalid}
                      placeholder="correo@dominio.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          {/* Sección 2: Asignación de Ubicación / Oficina */}
          <FieldGroup className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
            {/* Selector de Campus (Filtro previo) */}
            <Field>
              <FieldLabel htmlFor="filtro-campus">Campus</FieldLabel>
              <Selector
                id="filtro-campus"
                onSelect={(nuevoCampus) => {
                  setCampus(nuevoCampus);
                  // Opcional: Limpiar el valor de la oficina en RHF al cambiar de campus
                  formulario.setValue("idOficina", null);
                }}
                value={campus}
                fn={listar}
                textoCargando="Cargando campus..."
                textoNoDatos="No se encontraron campus"
                textoVacio="Seleccione un campus"
              />
              <FieldDescription className="text-xs text-muted-foreground">
                Filtre las oficinas seleccionando el campus correspondiente.
              </FieldDescription>
            </Field>

            {/* Selector de Oficina (Dependiente del campus) */}
            <Controller
              name="idOficina"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="selector-oficina">Oficina asignada</FieldLabel>
                  <Selector
                    {...field}
                    id="selector-oficina"
                    fn={() => listarOficinas(campus)}
                    deps={[campus]}
                    disabled={!campus} // 👈 Deshabilitado hasta que se elija un campus
                    onBlur={field.onBlur}
                    onSelect={field.onChange}
                    value={field.value}
                    invalid={fieldState.invalid}
                    textoCargando="Cargando oficinas..."
                    textoNoDatos="No hay oficinas disponibles en este campus"
                    textoVacio={campus ? "Seleccione una oficina" : "Primero elija un campus"}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>
    </ResponsiveModal>
  );
}

export default function AdministrarEncargadosPage() { //TODO: listado encargado, buscar encargado, mostrar encargado, editar encargado, eliminar encargado
  const {campusSeleccionado, setCampusSeleccionado} = useOutletContext();
  const [formularioEncargadoAbierto,setFormularioEncargadoAbierto] = useState(false);

  return (
    <div>
      <FormularioEncargado
        open={formularioEncargadoAbierto}
        onOpenChange={setFormularioEncargadoAbierto}
        onSend={()=>setFormularioEncargadoAbierto(false)}
      />
      <div>
        <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Encargados de oficina</h1>
            <p className="text-sm text-muted-foreground">Administre los encargados de oficina de la universidad.</p>
          </div>
          <Selector
                onSelect={(d)=>setCampusSeleccionado(d)}
                value={campusSeleccionado}
                fn={listar}
                textoCargando="Cargando listado de campus..."
                textoNoDatos="No hay campus"
                textoVacio="Ingrese un campus"
          />
          {/**<Button onClick={()=>controladorPanelFiltro.setAbierto(true)} variant="outline" disabled={objetos.cargando}>
              <SearchIcon />Abrir filtros
          </Button> */}
          <Button onClick={() => setFormularioEncargadoAbierto(true)}>
            <PlusIcon /> Crear encargado de oficina
          </Button>
        </header>
      </div>
    </div>
  )
}

/*export default function AdministrarEncargadosPage() {
  const [filtros, setFiltros] = useState(filtroDefecto);
  const alertas = useFetch(()=>alertaBusquedaService.listar(filtros),[filtros],[]);

  const onSubmitFiltros = (data) => {
    data.marcado = filtros.marcado;
    data.idEstado = 1;
    setFiltros(data);
  }

  const controladorPanelFiltro = usePanelFiltro(VALOR_DEFECTO_FILTRO,onSubmitFiltros);

  function toggleMarcados(data){
    setFiltros({
      ...filtros,
      marcado: data
    })
  }

  
  const [alertaAbierta, setAlertaAbierta] = useState(null);
  const [alertaOriginal,setAlertaOriginal] = useState(null);
  async function abrirAlerta(alerta){
    alertaBusquedaService.registrarLectura(alerta.id);
    setAlertaOriginal(alerta);
    setAlertaAbierta(alerta);
  }
  function toggleMarcarAlerta(valor){
    setAlertaAbierta({
      ...alertaAbierta,
      marcada: valor
    });
  }

  async function cerrarAlerta(){
    if(alertaOriginal.marcada !== alertaAbierta.marcada){
      if(alertaAbierta.marcada)
        await alertaBusquedaService.agregarMarcador(alertaAbierta.id);
      else 
        await alertaBusquedaService.quitarMarcador(alertaAbierta.id);
      alertas.recargar();
    }
    setAlertaAbierta(null);
    setAlertaOriginal(null);
  }

  async function onSendSolicitud() {
    if(!alertaOriginal.marcada)
      await alertaBusquedaService.agregarMarcador(alertaAbierta.id);
    setAlertaAbierta(null);
    setAlertaOriginal(null);
    alertas.recargar();
  }

  return (
    <div>
      <PanelFiltro controlador={controladorPanelFiltro}>
        <FieldGroup className="p-4 border-b">
            <Controller
              name="nombre"
              control={controladorPanelFiltro.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                    Nombre alerta
                </FieldLabel>
                <Input
                    {...field}
                    id={controladorPanelFiltro.idForm}
                    aria-invalid={fieldState.invalid}
                    placeholder="Laptop Asus negra perdida"
                    autoComplete="on"
                />
                {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                )}
                </Field>
            )}/>
            <Controller name="palabrasClave"
              control={controladorPanelFiltro.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                    Palabras clave
                </FieldLabel>
                <Input
                    {...field}
                    id={controladorPanelFiltro.idForm}
                    aria-invalid={fieldState.invalid}
                    placeholder="laptop negro stickers"
                    autoComplete="off"
                />
                <FieldDescription>Palabras separadas por espacio</FieldDescription>
                {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                )}
                </Field>
            )}/>
            <Controller
              name="etiquetasObjeto"
              control={controladorPanelFiltro.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={controladorPanelFiltro.idForm}>Etiquetas de objeto</FieldLabel>
                
                <SelectorEtiquetasObjeto
                    id={controladorPanelFiltro.idForm}
                    filtro={filtroEtiqueta}
                    field={field}
                />

                {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                )}
                </Field>
            )}
            />
        </FieldGroup>
      </PanelFiltro>
      <Drawer open={Boolean(alertaAbierta)} onOpenChange={cerrarAlerta} swipeDirection='left' >
        <DrawerContent>
            <DrawerHeader className="p-4">
              <DrawerTitle className="font-semibold text-lg">{alertaAbierta?.nombre}</DrawerTitle>
              <div className="flex flex-wrap gap-1">
                {alertaAbierta?.etiquetas?.map((etiqueta)=>(
                  <Badge variant={'default'}  key={`${alertaAbierta.id}-${etiqueta.id}`}>{etiqueta.nombre}</Badge>
                ))}
              </div>
              <Toggle pressed={alertaAbierta && alertaAbierta.marcada} onPressedChange={toggleMarcarAlerta} variant="outline">
                <BookmarkIcon className="group-aria-pressed/toggle:fill-foreground"/>Marcar
              </Toggle>
            </DrawerHeader>
            <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-2">
              
              {alertaAbierta?.fotos.length > 0 && (
                <div>
                  <span className="font-semibold text-sm text-foreground">
                    Fotos <span className='font-light text-muted-foreground'>(presione en una para expandirlo)</span>
                  </span>
                  <CarruselImagenes fotos={alertaAbierta?.fotos} swipeDirection={'left'} />
                </div>
              )}

              <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                <span className="font-semibold text-sm text-foreground">
                  Descripción:
                </span>
                
                <div className="flex-1 overflow-y-auto p-4 border rounded-2xl">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {alertaAbierta?.descripcion}
                  </p>
                </div>
              </div>

            </div>
            <DrawerFooter>
              {alertaAbierta && (
                <FormularioSolicitud alerta={alertaAbierta} onSend={onSendSolicitud}/>
              )}
              {alertaAbierta && (
                <FormularioReunion alerta={alertaAbierta} onSend={onSendSolicitud}/>
              )}
              <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
            </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Alertas de Búsqueda</h1>
          </div>

          <div className="flex items-center gap-2">
            <Toggle onPressedChange={toggleMarcados} variant="outline" disabled={alertas.cargando}>
              <BookmarkIcon className="group-aria-pressed/toggle:fill-foreground"/>Solo marcadas
            </Toggle>
            <Button onClick={()=>controladorPanelFiltro.setAbierto(true)} variant="outline" disabled={alertas.cargando}>
                <SearchIcon />Abrir filtros
            </Button>
          </div>
        </header>
        { alertas.cargando ? (
            <div className='align-middle justify-items-center'>
              <ItemCargando className="max-w-100" texto='Cargando alertas...' />
            </div>
          ) : (
            alertas.datos.length > 0 ? ( 
              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {alertas.datos.map((alerta)=>{
                  return (
                      <Card key={alerta.id} size="default" className='cursor-pointer hover:shadow-md transition-shadow' onClick={()=>abrirAlerta(alerta)}>
                        <CardHeader>
                          <CardTitle>
                            {alerta.nombre}
                            <div className='p-1'>
                              {alerta.leida ? 
                                (<Badge variant="secondary" className='p-1'><EyeIcon/>Leída</Badge>) : 
                                (alerta.marcada && (<Badge variant="default"><AlertCircle />Actualizada</Badge>))
                              }
                              {alerta.marcada ? 
                                (<Badge variant="secondary"className='p-1'><BookmarkIcon/>Marcada</Badge>) : 
                                (alerta.marcada && (<Badge variant="default"><AlertCircle />Actualizada</Badge>))
                              }
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{alerta.descripcion.length > LARGO_MAXIMO_DESCRIPCION_ALERTA ? 
                            `${alerta.descripcion.substring(0,LARGO_MAXIMO_DESCRIPCION_ALERTA)}...` : 
                            alerta.descripcion
                          }</CardDescription>
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-1">
                          {alerta.etiquetas?.map((etiqueta)=>(
                            <Badge variant={'default'}  key={`${alerta.id}-${etiqueta.id}`}>{etiqueta.nombre}</Badge>
                          ))}
                        </CardFooter>
                      </Card>
                  )
                })}
              </div>
            ) : (
              <div className='align-middle justify-items-center'>
                <ItemSinDatos className="max-w-100"/>
              </div>
            )
          )
        }
      </div>
    </div>
  )
}*/