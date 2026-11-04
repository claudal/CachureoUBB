import { Fragment } from "react"
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "./ui/combobox"
import { useFetch } from "../hooks/useFetch";
import { listar } from "../services/etiquetaObjetoService";
import { ItemCargando } from "./ui/item-cargando";

const listarEtiquetaObjeto = listar

export default function SelectorEtiquetasObjeto({id,field,filtro}){
    
    const {datos: etiquetasObjeto, cargando: etiquetasObjetoCargando} = useFetch(listarEtiquetaObjeto,filtro);
    const anchor = useComboboxAnchor();
    if(etiquetasObjetoCargando) return (
        <ItemCargando texto="Cargando etiquetas..." />
    )

    return (
        <Combobox
            id={id}
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
    )
}