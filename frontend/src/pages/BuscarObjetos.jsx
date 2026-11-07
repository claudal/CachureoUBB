import { listarPublico } from '../services/objetoPerdidoService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { ArrowRightCircleIcon, SearchIcon } from 'lucide-react';

import SelectorEtiquetasObjeto from '../components/SelectorEtiquetasObjeto.jsx';
import CarruselImagenes from '../components/CarruselImagenes.jsx';

import { FieldGroup, Field, FieldLabel, FieldDescription } from "../components/ui/field.js"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import { Button } from '../components/ui/button.js'
import { Input } from '../components/ui/input.js';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer.js';
import { PanelFiltro, usePanelFiltro } from '../components/PanelFiltros.jsx';
import { urlFoto } from '../utils/foto.utils.js';
import { Paginacion } from '../components/ui/paginacion.jsx';
import { Separator } from '../components/ui/separator';
import Selector from '../components/Selector.jsx';
import { listar } from '../services/campusService.js';
import { ResponsiveModal } from '../components/ui/responsive-modal.jsx';

const filtroEtiqueta = {}
const filtroBase = {
  salto: 0,
  cantidad: 15
}

const VALOR_DEFECTO_FILTRO = {
  "nombre": "",
  "palabrasClave": "",
  "etiquetasObjeto": []
}

export default function BuscarObjetos() {
  const [filtros, setFiltros] = useState(filtroBase);
  const onSubmitFiltros = (data) => {
    setFiltros({
      ...filtros,
      ...data,
      salto: filtroBase.salto,
      cantidad: filtroBase.cantidad
    });
  }
  const controladorPanelFiltro = usePanelFiltro(VALOR_DEFECTO_FILTRO,onSubmitFiltros);
  function onSelectCampus(idCampus){
    setFiltros({
      ...filtros,
      idCampus,
      salto: 0
    })
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
  
  const objetos = useFetch(()=>listarPublico(filtros),[filtros],[]);
  
  const [objetoAbierto, setObjetoAbierto] = useState(null);

  async function abrirObjeto(objeto){
    setObjetoAbierto(objeto);
  }

  async function cerrarObjeto(){
    setObjetoAbierto(null);
  }

  return (
    <div>
      <PanelFiltro controlador={controladorPanelFiltro}>
        <FieldGroup className="p-4 border-b">
            <Controller
              name="nombre"
              control={controladorPanelFiltro.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                      Nombre objeto
                  </FieldLabel>
                  <Input
                      {...field}
                      id={controladorPanelFiltro.idForm}
                      placeholder="Laptop Asus"
                      autoComplete="on"
                  />
                </Field>
            )}/>
            <Controller name="palabrasClave"
              control={controladorPanelFiltro.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                      Palabras clave
                  </FieldLabel>
                  <Input
                      {...field}
                      id={controladorPanelFiltro.idForm}
                      placeholder="laptop negro stickers"
                      autoComplete="off"
                  />
                  <FieldDescription>Palabras separadas por espacio</FieldDescription>
                </Field>
            )}/>
            <Controller
              name="etiquetasObjeto"
              control={controladorPanelFiltro.control}
              render={({ field}) => (
                <Field>
                  <FieldLabel htmlFor={controladorPanelFiltro.idForm}>Etiquetas de objeto</FieldLabel>
                  
                  <SelectorEtiquetasObjeto
                      id={controladorPanelFiltro.idForm}
                      filtro={filtroEtiqueta}
                      field={field}
                  />
                </Field>
            )}
            />
        </FieldGroup>
      </PanelFiltro>
      <Drawer open={Boolean(objetoAbierto)} onOpenChange={cerrarObjeto} swipeDirection='left' >
        <DrawerContent>
            <DrawerHeader className="p-4 border-b">
              <DrawerTitle className="font-semibold text-lg">{objetoAbierto?.nombre}</DrawerTitle>
              <div className="flex flex-wrap gap-1">
                {objetoAbierto?.etiquetas?.map((etiqueta)=>(
                  <Badge variant={'default'}  key={`${objetoAbierto.id}-${etiqueta.id}`}>{etiqueta.nombre}</Badge>
                ))}
              </div>
            </DrawerHeader>
            <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-2">
              
              <span className="font-semibold text-sm text-foreground">
                Fotos <span className='font-light text-muted-foreground'>(presione en una para expandirlo)</span>
              </span>
              <CarruselImagenes fotos={objetoAbierto?.fotos} swipeDirection={'left'} />

              <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                <span className="font-semibold text-sm text-foreground">
                  Descripción:
                </span>
                
                <div className="flex-1 overflow-y-auto p-4 border rounded-2xl">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {objetoAbierto?.descripcion}
                  </p>
                </div>
              </div>

            </div>
            <DrawerFooter>
              <ResponsiveModal
                trigger={<Button>Ver dónde está</Button>}
                title={`Oficina ${objetoAbierto?.oficina.nombre}`}
                closeButton={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}
              >
                <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-2">
                  <span className="font-semibold text-sm text-foreground">
                    Fotos <span className='font-light text-muted-foreground'>(presione en una para expandirlo)</span>
                  </span>
                  <CarruselImagenes fotos={objetoAbierto?.oficina.fotos} swipeDirection={'left'} />

                  <Separator />

                  <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Sección Descripción */}
                    <div>
                      <span className="font-semibold text-sm text-foreground block mb-1">
                        Descripción:
                      </span>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {objetoAbierto?.oficina.descripcion || "Sin descripción disponible."}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <span className="font-semibold text-sm text-foreground block mb-0.5">
                        Campus:
                      </span>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {objetoAbierto?.oficina.campus.nombre}
                      </p>
                    </div>

                    {/* Sección Dirección */}
                    <div>
                      <span className="font-semibold text-sm text-foreground block mb-0.5">
                        Dirección campus:
                      </span>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {objetoAbierto?.oficina.campus.direccion}
                      </p>
                    </div>
                  </div>

                </div>
              </ResponsiveModal>
              <Drawer swipeDirection='left' >
                <DrawerContent>
                    <DrawerFooter>
                      <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
                    </DrawerFooter>
                </DrawerContent>
              </Drawer>
              <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
            </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      <div>
        <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Objetos perdidos</h1>
            <p className="text-sm text-muted-foreground">Objetos perdidos en el campus.</p>
          </div>
          <Selector 
            onSelect={onSelectCampus}
            value={filtros.idCampus}
            fn={listar}
            textoCargando="Cargando campus..."
            textoNoDatos="No se pudo cargar los campus"
            textoVacio="Seleccione un campus"
          />
          <Button onClick={()=>controladorPanelFiltro.setAbierto(true)} variant="outline" disabled={objetos.cargando}>
              <SearchIcon />Abrir filtros
          </Button>
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
                      <Card key={objeto.id} className="overflow-hidden pt-0 cursor-pointer hover:shadow-md transition-shadow" onClick={()=>abrirObjeto(objeto)}>
                        {objeto.fotos[0] && (
                          <img
                            src={urlFoto(objeto.fotos[0].url)}
                            alt={objeto.nombre}
                            className="h-40 w-full bg-muted object-cover"
                          />
                        )}
                        <CardHeader>
                          <CardTitle>
                            {objeto.nombre}
                          </CardTitle>
                          <CardDescription>
                            {objeto.descripcion.length > 100 ? objeto.descripcion.substring(0, 100) + "..." : objeto.descripcion}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-wrap gap-1">
                          {objeto.etiquetas.map((etiqueta) => (
                            <Badge key={`${objeto.id}-${etiqueta.id}`} variant="outline">{etiqueta.nombre}</Badge>
                          ))}
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
            ) : (
              <div className='flex justify-center items-center p-8'>
                <ItemSinDatos className="max-w-100"/>
              </div>
            )
          )
        }
        <div className='align-middle justify-items-center py-6 pb-24'>
          <Paginacion 
            disabledBack={objetos.cargando || filtros.salto === 0}
            onBack={onSaltoRetroceder}
            disabledFoward={objetos.cargando || objetos.datos.length === 0}
            onFoward={onSaltoAvanzar}
          />
        </div>
      </div>
    </div>
  )
}