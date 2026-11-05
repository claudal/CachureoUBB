import { eliminarPorId, listarOficina } from '../services/objetoPerdidoService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { ArrowRightCircleIcon, CircleCheckIcon, GemIcon, GhostIcon, PackageSearchIcon, PenIcon, PlusIcon, SearchIcon, StarIcon, TrashIcon } from 'lucide-react';

import SelectorEtiquetasObjeto from '../components/SelectorEtiquetasObjeto.jsx';
import CarruselImagenes from '../components/CarruselImagenes.jsx';

import { FieldGroup, Field, FieldLabel, FieldDescription } from "../components/ui/field.js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group.js'
import { Button } from '../components/ui/button.js'
import { ButtonGroup } from '../components/ui/button-group.js'
import { Input } from '../components/ui/input.js';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';
import { PanelFiltro, usePanelFiltro } from '../components/PanelFiltros.jsx';
import { urlFoto } from '../utils/foto.utils.js';
import { DatePicker } from '../components/ui/date-picker.jsx';
import { useNavigate } from 'react-router-dom';
import { BotonEliminar } from '../components/ui/dialogo-eliminar.jsx';
import { useNotify } from '../hooks/useNotify.js';

const filtroEtiqueta = {}
const filtroBase = {
  idEstado: "1"
}
const VALOR_DEFECTO_FILTRO = {
  "idEstado": ["1"],
  "nombre": "",
  "palabrasClave": "",
  "etiquetasObjeto": [],
  "fechaEntrega": undefined,
  "fechaIngreso": undefined
}

export default function ObjetosOficinaPage() {
  const navigate = useNavigate();
  const notificacion = useNotify();

  const [filtros, setFiltros] = useState(filtroBase);
  const [filtroEstado, setFiltroEstado] = useState("1");

  const onSubmitFiltros = (data) => {
    const { idEstado, ...filtro } = data;
    setFiltros({
      ...filtro,
      idEstado: idEstado[0]
    });
    controladorPanelFiltro.formulario.resetField("fechaIngreso")
  }
  const controladorPanelFiltro = usePanelFiltro(VALOR_DEFECTO_FILTRO,onSubmitFiltros);
  
  const objetos = useFetch(()=>listarOficina(filtros),[filtros],[]);
  
  const [objetoAbierto, setObjetoAbierto] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  async function abrirObjeto(objeto){
    setObjetoAbierto(objeto);
  }

  async function eliminarObjeto(){
    setEliminando(true);
    try {
      await eliminarPorId(objetoAbierto.id);
      notificacion.exito("Objeto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el objeto:", error);
      notificacion.error("Hubo un error al eliminar el objeto");
    }
    setObjetoAbierto(null);
    objetos.recargar();
    setEliminando(false);
  }

  async function cerrarObjeto(){
    setObjetoAbierto(null);
  }

  return (
    <div>
      <PanelFiltro controlador={controladorPanelFiltro}>
        <FieldGroup className="p-4 border-b">
            <Controller
              name="idEstado"
              control={controladorPanelFiltro.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                      Estado del objeto
                  </FieldLabel>
                  <div className="flex flex-col gap-5">
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(val)=> {
                        if(!val) return;
                        setFiltroEstado(val[0]);
                        field.onChange(val);
                      }}
                      size="sm"
                      variant="outline"
                      spacing={1}
                      orientation="vertical"
                    >
                      <ToggleGroupItem value="1" aria-label="Sin entregar">
                        <PackageSearchIcon /> Sin entregar
                      </ToggleGroupItem>
                      <ToggleGroupItem value="2" aria-label="Entregados">
                        <CircleCheckIcon /> Entregados
                      </ToggleGroupItem>
                      <ToggleGroupItem value="3" aria-label="Vencidos">
                        <GhostIcon /> Abandonados
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </Field>
            )}/>
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

            
            <Controller name="fechaIngreso"
              control={controladorPanelFiltro.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                      Fecha de ingreso
                  </FieldLabel>
                  <DatePicker
                      id={controladorPanelFiltro.idForm}
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                  />
                </Field>
            )}/>

            {filtroEstado === "2" && (
              <Controller name="fechaEntrega"
                control={controladorPanelFiltro.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={controladorPanelFiltro.idForm}>
                        Fecha de entrega
                    </FieldLabel>
                    <DatePicker
                        id={controladorPanelFiltro.idForm}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                    />
                  </Field>
              )}/>
            )}
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
            {objetoAbierto?.idEstado === 1 ? (
              <DrawerFooter>
                <Button variant="outline" onClick={()=>navigate(`editarObjeto/${objetoAbierto.id}`)} disabled={eliminando}>
                  Editar<PenIcon/>
                </Button>
                <BotonEliminar textoBoton={eliminando ? "Eliminando..." : "Eliminar"} 
                titulo="Eliminar objeto" 
                descripcion="¿Está seguro de que desea eliminar este objeto?"
                disabled={eliminando}
                onClick={() => eliminarObjeto()} />
                <DrawerClose disabled={eliminando} render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
              </DrawerFooter>
              ) : (
                <DrawerFooter>
                  <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>} disabled={eliminando}/>
                </DrawerFooter>
              )}
        </DrawerContent>
      </Drawer>
      <div>
        <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Objetos perdidos</h1>
            <p className="text-sm text-muted-foreground">Objetos registrados en su oficina.</p>
          </div>
          <ButtonGroup >
            <ButtonGroup>
              <Button onClick={()=>controladorPanelFiltro.setAbierto(true)} variant="outline" disabled={objetos.cargando}>
                  <SearchIcon />Abrir filtros
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button onClick={() => navigate('registrarObjeto')}>
                <PlusIcon /> Registrar objeto
              </Button>
            </ButtonGroup>
          </ButtonGroup>
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
                    <Card key={objeto.id} className="overflow-hidden pt-0" onClick={()=>abrirObjeto(objeto)}>
                      {objeto.fotos[0] && (
                        <img
                          src={urlFoto(objeto.fotos[0].url)}
                          alt={objeto.nombre}
                          className="h-40 w-full bg-muted object-cover"
                        />
                      )}
                      <CardHeader>
                        <CardTitle className="flex flex-wrap items-center gap-2">
                          {objeto.nombre}
                          {objeto.valioso && (
                            <Badge variant="secondary"><GemIcon /> De valor</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Registrado el {new Date(objeto.fechaIngreso).toLocaleString(undefined,{dateStyle: "medium", timeStyle: 'short'})}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <div>
                          <Badge variant={objeto.estado.nombre === 'Sin entrega' ? 'default' : 'outline'}>
                            {objeto.estado.nombre}
                          </Badge>
                        </div>
                      </CardContent>
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