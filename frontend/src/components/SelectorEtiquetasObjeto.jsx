import { Fragment } from "react"
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "./ui/combobox"
import { useFetch } from "../hooks/useFetch";
import { listar } from "../services/etiquetaObjetoService";
import { ItemCargando } from "./ui/item-cargando";

const listarEtiquetaObjeto = listar

/**
 * Selector múltiple de etiquetas de objeto para usar con un Controller de react-hook-form.
 * El valor del campo es un arreglo de ids de etiqueta.
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {import("react-hook-form").ControllerRenderProps} props.field
 * @param {{valioso?: boolean}} [props.filtro] debe ser una constante declarada fuera del componente,
 *   si se crea en cada render useFetch vuelve a pedir las etiquetas sin parar
 * @param {(etiquetas: {id: number, nombre: string, valioso: boolean}[]) => void} [props.onSeleccion]
 *   recibe las etiquetas completas seleccionadas (no solo los ids)
 * @param {boolean} [props.invalido]
 */
export default function SelectorEtiquetasObjeto({id,field,filtro,onSeleccion,invalido}){

    const {datos: etiquetasObjeto, cargando: etiquetasObjetoCargando} = useFetch(listarEtiquetaObjeto,filtro);
    const anchor = useComboboxAnchor();
    if(etiquetasObjetoCargando) return (
        <ItemCargando texto="Cargando etiquetas..." />
    )

    function cambiarSeleccion(ids){
        field.onChange(ids);
        onSeleccion?.(etiquetasObjeto.filter((etiqueta) => ids.includes(etiqueta.id)));
    }

    return (
        <Combobox
            id={id}
            multiple
            autoHighlight
            value={field.value || []}
            onValueChange={cambiarSeleccion}
            onBlur={field.onBlur}
            ref={field.ref}
            items={etiquetasObjeto}
            disabled={etiquetasObjetoCargando}
            itemToStringValue={(etiqueta)=> etiqueta.nombre}
        >
            <ComboboxChips ref={anchor} className="w-full" aria-invalid={invalido}>
            <ComboboxValue>
                {(values) => (
                <Fragment>
                    {values?.map((value) => {
                    const etiqueta = etiquetasObjeto.find((item) => item.id === value)
                    if(!etiqueta) return null
                    return (
                    <ComboboxChip key={etiqueta.id}>
                        {etiqueta.nombre}
                    </ComboboxChip>
                    )})}
                    <ComboboxChipsInput placeholder={values?.length ? "" : "Buscar etiqueta..."} />
                </Fragment>
                )}
            </ComboboxValue>
            </ComboboxChips>

            <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No se encontraron etiquetas.</ComboboxEmpty>
            <ComboboxList>
                {etiquetasObjeto?.map((etiqueta) => (
                <ComboboxItem key={etiqueta.id} value={etiqueta.id}>
                    {etiqueta.nombre}
                </ComboboxItem>
                ))}
            </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
