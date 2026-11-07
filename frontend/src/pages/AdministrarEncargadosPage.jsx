import { PlusIcon } from 'lucide-react';
import { Button } from '../components/ui/button.js'
import { useNavigate, useOutletContext } from 'react-router-dom';
import Selector from '../components/Selector.jsx';
import { listar } from '../services/campusService.js';

export default function AdministrarEncargadosPage() { //TODO: listado encargado, buscar encargado, mostrar encargado, editar encargado, eliminar encargado
  const {campusSeleccionado, setCampusSeleccionado} = useOutletContext();
  const navigate = useNavigate();

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