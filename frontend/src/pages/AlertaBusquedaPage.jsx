import { useNavigate } from 'react-router-dom';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty';
import { useFetch } from '../hooks/useFetch.js';
import { buscarPorId } from '../services/alertaBusquedaService.js';
import { BellOffIcon, BellPlusIcon } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { useAlertaLocal } from '../hooks/useAlertaLocal.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';
import CarruselImagenes from '../components/CarruselImagenes.jsx';
import { CalendarIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react"

export default function AlertaBusquedaPage() {
  const alertaLocal = useAlertaLocal();
  const { datos: alerta, cargando } = useFetch(()=>buscarPorId(alertaLocal.id),[alertaLocal.id]);

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
