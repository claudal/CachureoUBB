import { listarOficina } from '../services/objetoPerdidoService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { AlertCircle, ArrowRightCircleIcon, BookmarkIcon, EyeIcon, SearchIcon } from 'lucide-react';

import SelectorEtiquetasObjeto from '../components/SelectorEtiquetasObjeto.jsx';
import CarruselImagenes from '../components/CarruselImagenes.jsx';

import { FieldError, FieldGroup, Field, FieldLabel, FieldDescription } from "../components/ui/field.js"
import { ScrollArea } from "../components/ui/scroll-area.js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import { Toggle } from '../components/ui/toggle.js'
import { Button } from '../components/ui/button.js'
import { Input } from '../components/ui/input.js';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerDescription, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';
import { PanelFiltro, usePanelFiltro } from '../components/PanelFiltros.jsx';

const filtroEtiqueta = {}
const filtro = {
  idEstado: 1
}
const VALOR_DEFECTO_FILTRO = {
  "nombre": "",
  "palabrasClave": "",
  "etiquetasObjeto": []
}

const LARGO_MAXIMO_DESCRIPCION_OBJETO = 100;

export default function ObjetosOficinaPage() {
  const [filtros, setFiltros] = useState(filtro);
  const objetos = useFetch(listarOficina,filtros);

  const onSubmitFiltros = (data) => {
    data.valioso = filtros.valioso;
    data.idEstado = 1;
    setFiltros(data);
  }

  const controladorPanelFiltro = usePanelFiltro(VALOR_DEFECTO_FILTRO,onSubmitFiltros);

  function toggleFiltroValioso(data){
    setFiltros({
      ...filtros,
      valioso: data
    })
  }

  
  const [objetoAbierto, setObjetoAbierto] = useState(null);

  async function abrirObjeto(objeto){
    setObjetoAbierto(objeto);
  }

  async function cerrarObjeto(){
    setObjetoAbierto(null);
    objetos.recargar();
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
                    Nombre objeto
                </FieldLabel>
                <Input
                    {...field}
                    id={controladorPanelFiltro.idForm}
                    aria-invalid={fieldState.invalid}
                    placeholder="Laptop Asus"
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
      <Drawer open={Boolean(objetoAbierto)} onOpenChange={cerrarObjeto} swipeDirection='left' >
        <DrawerContent className="flex flex-col h-full max-h-[100dvh] w-full sm:max-w-md ml-auto">
            <DrawerHeader className="p-4 border-b">
              <DrawerTitle className="font-semibold text-lg">{objetoAbierto?.nombre}</DrawerTitle>
              <div className="flex flex-wrap gap-1">
                {objetoAbierto?.etiquetas?.map((etiqueta)=>(
                  <Badge variant={'default'}  key={`${objetoAbierto.id}-${etiqueta.id}`}>{etiqueta.nombre}</Badge>
                ))}
              </div>
            </DrawerHeader>
            <div className="flex-1 min-h-0 flex flex-col p-4 gap-2 overflow-hidden">
              <CarruselImagenes fotos={objetoAbierto?.fotos} swipeDirection={'left'}/>
              <div className="flex-1 min-h-0 flex flex-col">
                <ScrollArea className="h-full w-full rounded-md border p-3">
                  <DrawerDescription className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {objetoAbierto?.descripcion}
                  </DrawerDescription>
                </ScrollArea>
              </div>
            </div>
            <DrawerFooter>
              <Button variant="secondary">
                  Solicitar más información
              </Button>
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
            <h1 className="text-2xl font-bold tracking-tight">Objetos de Búsqueda</h1>
          </div>

          <div className="flex items-center gap-2">
            <Toggle onPressedChange={toggleFiltroValioso} variant="outline" disabled={objetos.cargando}>
              <BookmarkIcon className="group-aria-pressed/toggle:fill-foreground"/>Solo marcadas
            </Toggle>
            <Button onClick={()=>controladorPanelFiltro.setAbierto(true)} variant="outline" disabled={objetos.cargando}>
                <SearchIcon />Abrir filtros
            </Button>
          </div>
        </header>
        { objetos.cargando ? (
            <div className='align-middle justify-items-center'>
              <ItemCargando className="max-w-100" texto='Cargando objetos...' />
            </div>
          ) : (
            objetos.datos.length > 0 ? ( 
              <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {objetos.datos.map((objeto)=>{
                  return (
                      <Card key={objeto.id} size="default" onClick={()=>abrirObjeto(objeto)}>
                        <CardHeader>
                          <CardTitle>
                            {objeto.nombre}
                            <div className='p-1'>
                              {objeto.leida ? 
                                (<Badge variant="secondary" className='p-1'><EyeIcon/>Leída</Badge>) : 
                                (objeto.marcada && (<Badge variant="default"><AlertCircle />Actualizada</Badge>))
                              }
                              {objeto.marcada ? 
                                (<Badge variant="secondary"className='p-1'><BookmarkIcon/>Marcada</Badge>) : 
                                (objeto.marcada && (<Badge variant="default"><AlertCircle />Actualizada</Badge>))
                              }
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{objeto.descripcion.length > LARGO_MAXIMO_DESCRIPCION_OBJETO ? 
                            `${objeto.descripcion.substring(0,LARGO_MAXIMO_DESCRIPCION_OBJETO)}...` : 
                            objeto.descripcion
                          }</CardDescription>
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-1">
                          {objeto.etiquetas?.map((etiqueta)=>(
                            <Badge variant={'default'}  key={`${objeto.id}-${etiqueta.id}`}>{etiqueta.nombre}</Badge>
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