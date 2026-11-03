import * as alertaBusquedaService from '../services/alertaBusquedaService.js';
import * as etiquetaObjetoService from '../services/etiquetaObjetoService.js';
import { useFetch } from '../hooks/useFetch.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import { Toggle } from '../components/ui/toggle.js'
import { Button } from '../components/ui/button.js'
import { Input } from '../components/ui/input.js';
import { AlertCircle, BookmarkIcon, EyeIcon, SearchIcon, XIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { FieldError, FieldGroup, Field, FieldLabel, FieldDescription } from "../components/ui/field.js"
import { Controller, useForm } from 'react-hook-form';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from '../components/ui/combobox.js';


const filtroEtiqueta = {valioso:true}
const filtro = {}

const LARGO_MAXIMO_DESCRIPCION_ALERTA = 100;
export default function AtenderAlertasPage() {
  const [filtros, setFiltros] = useState(filtro);
  const alertas = useFetch(alertaBusquedaService.listar,filtros);

  const [menuFiltro, setMenuFiltro] = useState(false);
  const formularioFiltro = useForm();
  const {datos: etiquetasObjeto, cargando: etiquetasObjetoCargando} = useFetch(etiquetaObjetoService.listar,filtroEtiqueta);
  const anchor = useComboboxAnchor()

  function onSubmit(data){
    data.marcado = filtros.marcado;
    setFiltros(data);
    setMenuFiltro(false);
  }

  function abrirMenuFiltro(){
    setMenuFiltro(true)
  }
  function toggleMarcados(data){
    setFiltros({
      ...filtros,
      marcado: data
    })
  }
  return (
    <div>
      <Drawer open={menuFiltro} onOpenChange={setMenuFiltro} swipeDirection='right'>
        <DrawerContent>
          <DrawerHeader className="p-4 border-b">
            <DrawerTitle className="font-semibold text-lg">Filtros</DrawerTitle>
          </DrawerHeader>
            <form id="form-filtros" onSubmit={formularioFiltro.handleSubmit(onSubmit)}>
              <FieldGroup className="p-4 border-b">
                <Controller name="nombre" control={formularioFiltro.control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-filtros">
                      Nombre alerta
                  </FieldLabel>
                  <Input
                      {...field}
                      id="form-filtros"
                      aria-invalid={fieldState.invalid}
                      placeholder="Laptop Asus negra perdida"
                      autoComplete="on"
                  />
                  {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                  )}
                  </Field>
                )}/>
                <Controller name="palabrasClave" control={formularioFiltro.control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-filtros">
                      Palabras clave
                  </FieldLabel>
                  <Input
                      {...field}
                      id="form-filtros"
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
                control={formularioFiltro.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-filtros">Etiquetas de objeto</FieldLabel>
                    
                    <Combobox
                      id="form-filtros"
                      multiple
                      autoHighlight
                      value={field.value || []}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      items={etiquetasObjeto}
                      disabled={etiquetasObjetoCargando}
                      itemToStringValue={(etiqueta)=> etiqueta.nombre}
                    >
                      <ComboboxChips ref={anchor} className="w-full max-w-xs">
                        <ComboboxValue>
                          {(values) => (
                            <Fragment>
                              {values?.map((value) => {
                                const etiqueta = etiquetasObjeto.find((item) => item.id === value)
                                return (
                                <ComboboxChip key={etiqueta.id}>
                                  {etiqueta.nombre}
                                </ComboboxChip>
                              )})}
                              <ComboboxChipsInput />
                            </Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>

                      <ComboboxContent anchor={anchor}>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {etiquetasObjeto?.map((etiqueta) => (
                            <ComboboxItem key={etiqueta.id} value={etiqueta.id}>
                              {etiqueta.nombre}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
                />
              </FieldGroup>
            </form>
          <DrawerFooter>
            <Button type="submit" form="form-filtros" disabled={formularioFiltro.formState.isSubmitting}>
                Aplicar filtros
            </Button>
            <DrawerClose render={<Button variant="outline"><XIcon/>Cancelar</Button>}/>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div>
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b mb-6">
          {/* Lado izquierdo: Título e identidad visual */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Alertas de Búsqueda</h1>
          </div>

          {/* Lado derecho: Acciones y Filtros */}
          <div className="flex items-center gap-2">
            <Toggle onPressedChange={toggleMarcados} variant="outline" disabled={alertas.cargando}>
              <BookmarkIcon className="group-aria-pressed/toggle:fill-foreground"/>Solo guardadas
            </Toggle>
            <Button onClick={abrirMenuFiltro} variant="outline" disabled={alertas.cargando}>
                <SearchIcon />Abrir filtros
            </Button>
          </div>
        </header>
        <div>
          {alertas.cargando ? (
            <h1>Cargando</h1>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {alertas.datos.map((alerta)=>{
                return (
                    <Card key={alerta.id} size="default" >
                      <CardHeader>
                        <CardTitle>
                          {alerta.nombre}
                          <span className='p-1'>
                            {alerta.leida ? 
                              (<Badge variant="secondary"><EyeIcon/>Leída</Badge>) : 
                              (alerta.marcada && (<Badge variant="default"><AlertCircle />Actualizada</Badge>))
                            }
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{alerta.descripcion.length > LARGO_MAXIMO_DESCRIPCION_ALERTA ? 
                          `${alerta.descripcion.substring(0,LARGO_MAXIMO_DESCRIPCION_ALERTA)}...` : 
                          alerta.descripcion
                        }</CardDescription>
                      </CardContent>
                      <CardFooter>
                        {alerta.etiquetas?.map((etiqueta)=>(
                          <span className='p-0.5'>
                            <Badge variant={'default'} key={`${alerta.id}-${etiqueta.id}`}>{etiqueta.nombre}</Badge>
                          </span>
                        ))}
                      </CardFooter>
                    </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}