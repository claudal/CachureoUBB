import { useNavigate } from 'react-router-dom';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty';
import { useFetch } from '../hooks/useFetch.js';
import { buscarPorId } from '../services/alertaBusquedaService.js';
import { ArrowRightCircleIcon, BellOffIcon, BellPlusIcon, InfoIcon, UserSearchIcon } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { useAlertaLocal } from '../hooks/useAlertaLocal.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion.js';
import { Badge } from '../components/ui/badge.js';
import CarruselImagenes from '../components/CarruselImagenes.jsx';
import { CalendarIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/ui/drawer.js';
import { Separator } from '../components/ui/separator.js';
import { useEffect } from 'react';

export default function AlertaBusquedaPage() {
  const alertaLocal = useAlertaLocal();
  const { datos: alerta, cargando, error } = useFetch(()=>buscarPorId(alertaLocal.id),[alertaLocal.id]);
  
  useEffect(()=>{
    if(!error) return;
    if(error.codigo === 404)
      alertaLocal.clearIdAlerta();
  },[error]);

  const navigate = useNavigate();

  return (
    <div>
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerta de búsqueda</h1>
          <p className="text-sm text-muted-foreground">
            Administre su alerta de búsqueda de objeto valioso.
          </p>
        </div>
      </header>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {cargando ? (
          <ItemCargando texto="Cargando alerta..." />
        ) : alerta ? (
          <Card className="border shadow-smx w-full" >
            <CardHeader className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl">{alerta.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                    <MapPinIcon className="h-4 w-4 text-primary shrink-0" />
                    <span>Buscando en campus: {alerta.campus?.nombre}</span>
                  </CardDescription>
                </div>
                
                {/* Badges de etiquetas */}
                <div className="flex flex-wrap gap-1.5">
                  {alerta.etiquetas.map((etiqueta) => (
                    <Badge key={etiqueta.id} variant="secondary">
                      {etiqueta.nombre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Fechas de creación / edición */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Creada: {new Date(alerta.fechaCreacion).toLocaleDateString()}
                </span>
                {alerta.fechaEdicion && alerta.fechaCreacion !== alerta.fechaEdicion && (
                  <span className="flex items-center gap-1 text-muted-foreground/80">
                    • Editada: {new Date(alerta.fechaEdicion).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardHeader>
              
            <CardContent className="space-y-4">

              {/* Desplegable de mensajes (solicitudes de detalle y reuniones) */}
              {(alerta.solicitudesDetalles.length > 0 || alerta.reuniones.length > 0) && (
                <Accordion defaultValue={[]}>
                  {alerta.solicitudesDetalles.length > 0 && (
                    <AccordionItem key='solicitudesDetalles' value='solicitudesDetalles'>
                      <AccordionTrigger><InfoIcon/>Solicitudes de detalles</AccordionTrigger>
                      <AccordionContent>
                        Uno o varios encargados de oficina creen tener tu objeto, pero requieren más información.
                        Revisa las solicitudes y edita tu alerta para ingresar la información adicional.
                        <Accordion defaultValue={[]}>
                          {alerta.solicitudesDetalles.map((solicitud)=>(
                            <AccordionItem
                              key={`solicitudDetalle-${solicitud.fechaCreacion}`}
                              value={`solicitudDetalle-${solicitud.fechaCreacion}`}
                            >
                              <AccordionTrigger  className="text-sm">Fecha: {new Date(solicitud.fechaCreacion).toLocaleString()}</AccordionTrigger>
                              <AccordionContent>
                                {solicitud.indicaciones}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {alerta.reuniones.length > 0 && (
                    <AccordionItem key='reuniones' value='reuniones'>
                      <AccordionTrigger><UserSearchIcon/>Reuniones</AccordionTrigger>
                      <AccordionContent>
                        Uno o varios encargados de oficina creen tener tu objeto y enviaron la ubicación de su oficina
                        para que puedas reclamar el objeto.
                        <Accordion defaultValue={[]}>
                          {alerta.reuniones.map((reunion)=>(
                            <AccordionItem
                              key={`reunion-${reunion.fechaCreacion}`}
                              value={`reunion-${reunion.fechaCreacion}`}
                            >
                              <AccordionTrigger  className="text-sm">Fecha: {new Date(reunion.fechaCreacion).toLocaleString()}</AccordionTrigger>
                              <AccordionContent>
                                <Drawer swipeDirection='left' >
                                  <DrawerContent>
                                      <DrawerHeader className="p-4 border-b">
                                        <DrawerTitle className="font-semibold text-lg">Oficina {reunion.oficina.nombre}</DrawerTitle>
                                      </DrawerHeader>
                                      <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-2">
                                        <span className="font-semibold text-sm text-foreground">
                                          Fotos <span className='font-light text-muted-foreground'>(presione en una para expandirlo)</span>
                                        </span>
                                        <CarruselImagenes fotos={reunion.oficina.fotos} swipeDirection={'left'} />

                                        <Separator />

                                        <div className="flex-1 overflow-y-auto space-y-4">
                                          {/* Sección Descripción */}
                                          <div>
                                            <span className="font-semibold text-sm text-foreground block mb-1">
                                              Descripción:
                                            </span>
                                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                              {reunion.oficina.descripcion || "Sin descripción disponible."}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <DrawerFooter>
                                        <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
                                      </DrawerFooter>
                                  </DrawerContent>
                                  Indicaciones: {reunion.indicaciones}
                                  <DrawerTrigger render={<Button variant="link">Ver ubicación oficina</Button>} />
                                </Drawer>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              )}
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Descripción:
              </span>
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {alerta.descripcion || "Sin descripción proporcionada."}
              </div>

              {alerta.fotos && alerta.fotos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                    Fotos adjuntas ({alerta.fotos.length})
                  </span>
                  <CarruselImagenes fotos={alerta.fotos} />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t pt-4 bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`editar/${alerta.id}`)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {alertaLocal.clearIdAlerta(); alerta}}
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellOffIcon />
              </EmptyMedia>
              <EmptyTitle>Sin alerta de búsqueda</EmptyTitle>
              <EmptyDescription className="max-w-xm text-pretty">
                Si se te ha perdido un objeto de valor (teléfono, joya cara, etc.), este no aparecerá en la lista de objetos por
                seguridad.<br />
                Una alerta de búsqueda te permite comunicarte con las personas que guardan los objetos valiosos, mostrar evidencias
                de tu autoría y, si alguno tiene tu objeto, te enviará la ubicación donde podrás reclamar tu objeto.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => navigate("crear")}>
                <BellPlusIcon data-icon="inline-start" />
                Crear alerta
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
