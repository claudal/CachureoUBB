import { useNavigate, useParams } from 'react-router-dom';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty';
import { useFetch } from '../hooks/useFetch.js';
import { buscarLocal } from '../services/alertaBusquedaService.js';
import { BellOffIcon, BellPlusIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '../components/ui/button.js';

export default function AlertaBusquedaPage() {
  const { datos: alerta, cargando } = useFetch(buscarLocal);

  const navigate = useNavigate();

  return (
    <div>
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerta de búsqueda</h1>
          <p className="text-sm text-muted-foreground">Administre su alerta de búsqueda de objeto valioso.</p>
        </div>
      </header>
      {cargando ? <ItemCargando texto='Cargando alerta...' /> : (
        alerta ? (
          <div>aaaa</div>
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
              <Button variant="outline" onClick={()=>navigate("crear")}>
                <BellPlusIcon data-icon="inline-start" />
                Crear alerta
              </Button>
            </EmptyContent>
          </Empty>
        )
      )}
    </div>
  );
}
