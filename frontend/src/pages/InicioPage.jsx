import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, GemIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ItemCargando } from '@/components/ui/item-cargando';
import { useFetch } from '../hooks/useFetch';
import { listar } from '../services/objetoPerdidoService';
import { urlFoto } from '../utils/urlFoto';

const LARGO_MAXIMO_DESCRIPCION = 100;

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

export default function InicioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const objetos = useFetch(listar);

  // mensaje que deja la página de registro al volver
  const [mensaje] = useState(location.state?.mensaje ?? null);
  useEffect(() => {
    // se limpia el state para que el mensaje no reaparezca al recargar
    if (location.state?.mensaje)
      navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  return (
    <div className="mx-auto w-full max-w-5xl pb-28">
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Objetos perdidos</h1>
          <p className="text-sm text-muted-foreground">Objetos registrados en su oficina.</p>
        </div>
        <Button size="lg" onClick={() => navigate('registrarObjeto')}>
          <PlusIcon /> Registrar objeto
        </Button>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {mensaje && (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>Registro exitoso</AlertTitle>
            <AlertDescription>{mensaje}</AlertDescription>
          </Alert>
        )}

        {objetos.error && (
          <Alert variant="destructive">
            <AlertTitle>No se pudieron cargar los objetos</AlertTitle>
            <AlertDescription>{objetos.error}</AlertDescription>
          </Alert>
        )}

        {objetos.cargando ? (
          <ItemCargando texto="Cargando objetos..." />
        ) : objetos.datos.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Aún no hay objetos registrados en su oficina.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {objetos.datos.map((objeto) => (
              <Card key={objeto.id} className="overflow-hidden pt-0">
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
                    Registrado el {formatoFecha.format(new Date(objeto.fechaIngreso))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div>
                    <Badge variant={objeto.estado.nombre === 'Sin entrega' ? 'default' : 'outline'}>
                      {objeto.estado.nombre}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {objeto.descripcion.length > LARGO_MAXIMO_DESCRIPCION
                      ? `${objeto.descripcion.substring(0, LARGO_MAXIMO_DESCRIPCION)}...`
                      : objeto.descripcion}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-1">
                  {objeto.etiquetas.map((etiqueta) => (
                    <Badge key={`${objeto.id}-${etiqueta.id}`} variant="outline">{etiqueta.nombre}</Badge>
                  ))}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
