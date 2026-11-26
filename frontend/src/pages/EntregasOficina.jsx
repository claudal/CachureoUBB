import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowRightCircleIcon, GemIcon, SearchIcon, XIcon } from 'lucide-react';

import CarruselImagenes from '../components/CarruselImagenes.jsx';
import DetalleEntrega from '../components/DetalleEntrega.jsx';
import { PanelFiltro, usePanelFiltro } from '../components/PanelFiltros.jsx';

import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert.js';
import { Badge } from '../components/ui/badge.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { DatePicker } from '../components/ui/date-picker.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';
import { Field, FieldError, FieldGroup, FieldLabel } from '../components/ui/field.js';
import { Input } from '../components/ui/input.js';
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { ItemSinDatos } from '../components/ui/item-sin-datos.jsx';
import { Paginacion } from '../components/ui/paginacion.jsx';

import { useFetch } from '../hooks/useFetch.js';
import { FiltroEntregaSchema } from '../schemas/entrega.schema.js';
import { listarOficina } from '../services/entregaService.js';
import { urlFoto } from '../utils/foto.utils.js';
import { formatear } from '../utils/rut.utils.js';

const CANTIDAD_POR_PAGINA = 15;

const FILTRO_DEFECTO = {
  nombreObjeto: '',
  nombreReclamante: '',
  rutReclamante: '',
  fechaEntrega: undefined
};

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function EntregasOficinaPage() {
  const [filtros, setFiltros] = useState(FILTRO_DEFECTO);
  const [salto, setSalto] = useState(0);
  const [entregaAbierta, setEntregaAbierta] = useState(null);

  // al cambiar los filtros se vuelve a la primera pagina
  function aplicarFiltros(datos) {
    setFiltros(datos);
    setSalto(0);
  }
  const controladorFiltro = usePanelFiltro(FILTRO_DEFECTO, aplicarFiltros, {
    resolver: zodResolver(FiltroEntregaSchema)
  });

  function limpiarFiltros() {
    controladorFiltro.formulario.reset(FILTRO_DEFECTO);
    aplicarFiltros(FILTRO_DEFECTO);
  }
  const hayFiltros = Object.values(filtros).some(Boolean);

  const entregas = useFetch(
    () => listarOficina({ ...filtros, salto, cantidad: CANTIDAD_POR_PAGINA }),
    [filtros, salto],
    []
  );

  return (
    <div>
      <PanelFiltro controlador={controladorFiltro}>
        <FieldGroup className="space-y-4">
          <Controller
            name="nombreReclamante"
            control={controladorFiltro.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="filtro-nombre-reclamante">Nombre del reclamante</FieldLabel>
                <Input
                  {...field}
                  id="filtro-nombre-reclamante"
                  placeholder="Nombre o parte del nombre"
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name="rutReclamante"
            control={controladorFiltro.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="filtro-rut-reclamante">RUT del reclamante</FieldLabel>
                <Input
                  {...field}
                  id="filtro-rut-reclamante"
                  aria-invalid={fieldState.invalid}
                  placeholder="11.111.111-1"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="nombreObjeto"
            control={controladorFiltro.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="filtro-nombre-objeto">Nombre del objeto</FieldLabel>
                <Input
                  {...field}
                  id="filtro-nombre-objeto"
                  placeholder="Laptop Asus"
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name="fechaEntrega"
            control={controladorFiltro.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="filtro-fecha-entrega">Fecha de entrega</FieldLabel>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </PanelFiltro>

      <Drawer open={Boolean(entregaAbierta)} onOpenChange={() => setEntregaAbierta(null)} swipeDirection='left'>
        <DrawerContent>
          <DrawerHeader className="p-4 border-b">
            <DrawerTitle className="font-semibold text-lg">{entregaAbierta?.objeto.nombre}</DrawerTitle>
            <div className="flex flex-wrap gap-1">
              {entregaAbierta?.objeto.etiquetas.map((etiqueta) => (
                <Badge key={etiqueta.id} variant="default">{etiqueta.nombre}</Badge>
              ))}
            </div>
          </DrawerHeader>
          <div className="flex-1 min-h-0 flex flex-col gap-4 px-4 py-2 overflow-y-auto">
            <span className="font-semibold text-sm text-foreground">
              Fotos del objeto <span className='font-light text-muted-foreground'>(presione en una para expandirlo)</span>
            </span>
            <CarruselImagenes fotos={entregaAbierta?.objeto.fotos} />

            <div className="shrink-0">
              <DetalleEntrega entrega={entregaAbierta} />
            </div>

            <div className="flex-1 min-h-32 flex flex-col gap-1.5">
              <span className="font-semibold text-sm text-foreground">
                Descripción:
              </span>
              <div className="flex-1 overflow-y-auto p-4 border rounded-2xl">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {entregaAbierta?.objeto.descripcion}
                </p>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon /></Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entregas</h1>
          <p className="text-sm text-muted-foreground">Historial de objetos entregados por su oficina.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {hayFiltros && (
            <Button variant="ghost" onClick={limpiarFiltros}>
              <XIcon />Limpiar filtros
            </Button>
          )}
          <Button variant="outline" onClick={() => controladorFiltro.setAbierto(true)} disabled={entregas.cargando}>
            <SearchIcon />Abrir filtros
          </Button>
        </div>
      </header>

      {entregas.cargando ? (
        <div className="align-middle justify-items-center">
          <ItemCargando className="max-w-100" texto="Cargando entregas..." />
        </div>
      ) : entregas.error ? (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar el historial de entregas</AlertTitle>
            <AlertDescription>{entregas.error.mensaje}</AlertDescription>
          </Alert>
        </div>
      ) : entregas.datos.length > 0 ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {entregas.datos.map((entrega) => (
            <Card key={entrega.id} className="overflow-hidden pt-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setEntregaAbierta(entrega)}>
              {entrega.objeto.fotos[0] && (
                <img
                  src={urlFoto(entrega.objeto.fotos[0].url)}
                  alt={entrega.objeto.nombre}
                  className="h-40 w-full bg-muted object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {entrega.objeto.nombre}
                  {entrega.objeto.valioso && (
                    <Badge variant="secondary"><GemIcon /> De valor</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Entregado el {formatearFecha(entrega.fechaEntrega)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Retiró</dt>
                  <dd className="break-words">
                    {entrega.reclamante.nombreReclamante}
                    <span className="block text-muted-foreground">{formatear(entrega.reclamante.rut)}</span>
                  </dd>
                  <dt className="text-muted-foreground">Entregado por</dt>
                  <dd className="break-words">{entrega.encargado.nombre}</dd>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="align-middle justify-items-center p-4">
          <ItemSinDatos
            className="max-w-100"
            titulo="No hay entregas"
            descripcion={
              hayFiltros || salto > 0
                ? 'Ninguna entrega coincide con la búsqueda'
                : 'Su oficina aún no registra entregas'
            }
          />
        </div>
      )}

      <div className="align-middle justify-items-center py-6">
        <Paginacion
          disabledBack={entregas.cargando || salto === 0}
          onBack={() => setSalto(salto - CANTIDAD_POR_PAGINA)}
          disabledFoward={entregas.cargando || entregas.datos.length < CANTIDAD_POR_PAGINA}
          onFoward={() => setSalto(salto + CANTIDAD_POR_PAGINA)}
        />
      </div>
    </div>
  );
}
