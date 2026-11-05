import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox"
import { useFetch } from "../hooks/useFetch";
import { listar } from "../services/campusService.js";
import { ItemCargando } from "./ui/item-cargando";


export default function SelectorCampus({ id, onSelect, value }) {
  const { datos, cargando } = useFetch(listar, [], []);

  if (cargando) return <ItemCargando texto="Cargando campuses..." />;

  return (
    <Combobox
      id={id}
      items={datos}
      disabled={cargando}
      value={value}
      // 1. Captura el objeto campus completo o el valor seleccionado
      onValueChange={(campusSeleccionado) => {
        if (campusSeleccionado) {
          // Devuelve directamente el ID numérico/string al padre
          onSelect(campusSeleccionado.id);
        }
      }}
      itemToStringValue={(campus) => String(campus?.id ?? '')}
      itemToStringLabel={(campus) => campus?.nombre ?? ''}
    >
      <ComboboxInput placeholder="Elija un campus donde buscar" />
      <ComboboxContent>
        <ComboboxEmpty>No se han encontrado campuses.</ComboboxEmpty>
        <ComboboxList>
          {(campus) => (
            <ComboboxItem key={campus.id} value={campus}>
              {campus.nombre}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}