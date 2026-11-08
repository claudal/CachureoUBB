import { BuildingIcon, GhostIcon, IdCardIcon, MailIcon, PenIcon, PlusIcon, RotateCwClockIcon, SendIcon, SmileIcon, TrashIcon, UserMinus, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button.js'
import { useNavigate, useOutletContext } from 'react-router-dom';
import Selector from '../components/Selector.jsx';
import { listar } from '../services/campusService.js';
import * as encargadoOficinaService from '../services/encargadoOficinaService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useState } from 'react';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import {} from 'lucide-react';
import { useNotify } from '../hooks/useNotify.js';
import { Paginacion } from '../components/ui/paginacion.jsx';

const filtroDefecto = {
  cantidad: 15,
  salto: 0
}

export default function AdministrarEncargadosPage() { //TODO: listado encargado, buscar encargado, mostrar encargado, editar encargado, eliminar encargado
  const {campusSeleccionado, setCampusSeleccionado} = useOutletContext();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState(filtroDefecto);
  const encargados = useFetch(()=>encargadoOficinaService.listar(filtros),[filtros],[]);
  const [enviandoCorreo,setEnviandoCorreo] = useState(false);
  const notificacion = useNotify();

  async function onReenviarCorreo(encargado){
    setEnviandoCorreo(true);
      try {
        await encargadoOficinaService.reenviarCorreoCreacion(encargado.rut);
        notificacion.exito("Se reenvió el correo de creación exitosamente");
      }catch(err){
        notificacion.error("Hubo un error al reenviar el correo de creación. Inténtelo más tarde.");
      }
    setEnviandoCorreo(false);
  };

  async function onEliminar(encargado) { //TODO
    
  }

  async function onCambiarEstado(encargado) { //TODO
    
  }

  function onEditar(encargado) { //TODO

  }


  function onSaltoAvanzar(){
    setFiltros({
      ...filtros,
      salto: filtros.salto+filtros.cantidad
    })
  }
  function onSaltoRetroceder(){
    setFiltros({
      ...filtros,
      salto: filtros.salto-filtros.cantidad
    })
  }

  return (
    <div>
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
          <Button onClick={() => navigate("crearEncargado")}>
            <PlusIcon /> Crear encargado de oficina
          </Button>
        </header>
        { encargados.cargando ? (
            <div className='align-middle justify-items-center'>
              <ItemCargando className="max-w-100" texto='Cargando encargados de oficina...' />
            </div>
          ) : (
            encargados.datos.length > 0 ? ( 
              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                {encargados.datos.map((encargado)=>{
                  return (
                    <Card key={encargado.rut} size="default" className="hover:shadow-md transition-shadow flex flex-col justify-between">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-lg font-semibold leading-tight">
                                {encargado.nombre}
                              </CardTitle>
                              {
                                encargado.idEstado === 1 && (
                                  <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                                    <SmileIcon className="h-3.5 w-3.5" />
                                    <span>{encargado.estado.nombre}</span>
                                  </Badge>
                                )
                              }
                              {
                                encargado.idEstado === 2 && (
                                  <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                                    <RotateCwClockIcon className="h-3.5 w-3.5" />
                                    <span>{encargado.estado.nombre}</span>
                                  </Badge>
                                )
                              }
                              {
                                encargado.idEstado === 3 && (
                                  <Badge variant="destructive" className="flex items-center gap-1 shrink-0">
                                    <GhostIcon className="h-3.5 w-3.5" />
                                    <span>{encargado.estado.nombre}</span>
                                  </Badge>
                                )
                              }
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-2 text-sm text-muted-foreground flex-1">
                            <div className="flex items-center gap-2">
                              <IdCardIcon className="h-4 w-4 shrink-0" />
                              <span>{encargado.rut}</span>
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
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => onEditar(encargado)}
                            >
                              <PenIcon />Editar
                            </Button>
                            {encargado.idEstado === 2 && (
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => onEliminar(encargado)}
                              >
                                <TrashIcon />Eliminar
                              </Button>
                            )}
                            {encargado.idEstado === 1 && (
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => onCambiarEstado(encargado, 3)}
                              >
                                <UserMinus />Deshabilitar
                              </Button>
                            )}
                            {encargado.idEstado === 3 && (
                              <Button 
                                variant="default" 
                                className="w-full"
                                onClick={() => onCambiarEstado(encargado, 1)}
                              >
                                <UserPlus />Habilitar
                              </Button>
                            )}

                            {encargado.idEstado === 2 && !encargado.correoReenviado && (
                              <Button 
                                variant="secondary" 
                                className="w-full"
                                onClick={() => onReenviarCorreo(encargado)}
                                disabled={enviandoCorreo}
                              >
                                <SendIcon />Reenviar correo de creación
                              </Button>
                            )}
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
        <div className='align-middle justify-items-center py-6 pb-24'>
          <Paginacion 
            disabledBack={encargados.cargando || filtros.salto === 0}
            onBack={onSaltoRetroceder}
            disabledFoward={encargados.cargando || encargados.datos.length === 0}
            onFoward={onSaltoAvanzar}
          />
        </div>
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
        
      </div>
    </div>
  )
}*/