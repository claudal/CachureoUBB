import { Fragment } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor
} from "./ui/combobox"
import { useFetch } from "../hooks/useFetch"
import { listar } from "../services/etiquetaObjetoService"
import { ItemCargando } from "./ui/item-cargando"

export default function SelectorEtiquetasObjeto({ id, field, filtro, onSeleccion, invalido }) {
  const { datos: etiquetasObjeto = [], cargando: etiquetasObjetoCargando } = useFetch(
    () => listar(filtro),
    [filtro],
    []
  )
  const anchor = useComboboxAnchor()

  if (etiquetasObjetoCargando) {
    return <ItemCargando texto="Cargando etiquetas..." />
  }

  // 1. Convertimos los IDs de field.value a los objetos completos que espera el Combobox
  const valoresSeleccionados = (field.value || [])
    .map((idVal) => etiquetasObjeto.find((item) => item.id === idVal))
    .filter(Boolean)

  function cambiarSeleccion(objetosSeleccionados) {
    // 2. Extraemos los IDs para el formulario y enviamos los objetos completos a onSeleccion
    const ids = objetosSeleccionados.map((item) => item.id)
    field.onChange(ids)
    onSeleccion?.(objetosSeleccionados)
  }

  return (
    <Combobox
      id={id}
      multiple
      autoHighlight
      value={valoresSeleccionados}
      onValueChange={cambiarSeleccion}
      onBlur={field.onBlur}
      ref={field.ref}
      items={etiquetasObjeto}
      disabled={etiquetasObjetoCargando}
      // Indica al Combobox qué campo debe usar para filtrar con la búsqueda de texto
      itemToStringLabel={(etiqueta) => etiqueta?.nombre ?? ''}
      itemToStringValue={(etiqueta) => etiqueta?.nombre ?? ''}
    >
      <ComboboxChips ref={anchor} className="w-full" aria-invalid={invalido}>
        <ComboboxValue>
          {(values) => (
            <Fragment>
              {values?.map((etiqueta) => (
                <ComboboxChip key={etiqueta.id}>
                  {etiqueta.nombre}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={values?.length ? "" : "Buscar etiqueta..."} />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No se encontraron etiquetas.</ComboboxEmpty>
        <ComboboxList>
          {/* 3. Render function para que el Combobox aplique el filtrado dinámico */}
          {(etiqueta) => (
            <ComboboxItem key={etiqueta.id} value={etiqueta}>
              {etiqueta.nombre}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}