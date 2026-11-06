import * as alertaBusquedaService from '../services/alertaBusquedaService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AlertCircle, AlertCircleIcon, ArrowRightCircleIcon, BookmarkIcon, EyeIcon, SearchIcon, SendHorizontalIcon } from 'lucide-react';

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
import { useAuth } from '../context/AutenticacionContext.jsx';
import { useNotify } from '../hooks/useNotify.js';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrearSolicitudDetallesSchema } from '../schemas/alertaBusqueda.schema.js';

const filtroEtiqueta = {valioso:true}
const filtroAlerta = {
  idEstado: 1
}
const VALOR_DEFECTO_FILTRO = {
  "nombre": "",
  "palabrasClave": "",
  "etiquetasObjeto": []
}

const LARGO_MAXIMO_DESCRIPCION_ALERTA = 100;

function FormularioSolicitud({alerta,onSend}){
  const notificacion = useNotify();
  const [apiError, setApiError] = useState('');
  const formulario = useForm({
    resolver: zodResolver(CrearSolicitudDetallesSchema),
    defaultValues: {
      indicaciones: ""
    }
  });

  async function onSubmit(data){
    setApiError(null);
    try {
      await alertaBusquedaService.crearSolicitud(alerta.id, data);
      notificacion.exito(`Solicitud de información enviada correctamente`);
      onSend();
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
    <Drawer swipeDirection='left' >
      <DrawerTrigger render={<Button variant="outline">Solicitar más información</Button>} />
      <DrawerContent className="max-w-lg mx-auto">
        <DrawerHeader className="p-4 sm:p-6 border-b text-left">
          <DrawerTitle className="text-xl">Solicitar más información</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Alerta: <span className="font-semibold text-foreground">{alerta.nombre}</span>
          </DrawerDescription>
        </DrawerHeader>

        {/* Contenedor scrolleable del cuerpo del Drawer */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>No se pudo enviar la solicitud</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form id="form-solicitud" onSubmit={formulario.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="indicaciones"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-2">
                    <FieldLabel
                      htmlFor="solicitud-indicaciones"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      ¿Qué información va a solicitar?
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="solicitud-indicaciones"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ej: Modelo exacto del objeto, color del protector, o fotos que evidencien su autoría..."
                      className="min-h-32 resize-none text-sm leading-relaxed"
                    />

                    <FieldDescription className="text-xs text-muted-foreground leading-normal">
                      Indique los detalles necesarios si no está seguro de que el objeto en su oficina coincide con la alerta, o si requiere mayor evidencia.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} className="text-xs text-destructive font-medium" />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <DrawerFooter className="p-4 sm:p-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
          <Button
            type="submit"
            form="form-solicitud"
            size="lg"
            className="w-full sm:w-auto"
            disabled={formulario.formState.isSubmitting}
          >
            {formulario.formState.isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud'}<SendHorizontalIcon />
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default function AtenderAlertasPage() {
  const [filtros, setFiltros] = useState(filtroAlerta);
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
              
              {alertaAbierta?.fotos.lenght > 0 && (
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
              <Button>
                  Revelar oficina
              </Button>
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
                      <Card key={alerta.id} size="default" onClick={()=>abrirAlerta(alerta)}>
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
}