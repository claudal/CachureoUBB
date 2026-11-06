import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox"
import { useFetch } from "../hooks/useFetch";
import { listar } from "../services/campusService.js";


export default function SelectorCampus({
  id,
  onSelect,
  value = null, // 1. Fallback por defecto a null para asegurar que SIEMPRE sea controlado
  invalid = false,
  ...props
}) {
  const { datos = [], cargando } = useFetch(listar, [], []);

  // 2. Resolvemos el objeto completo que corresponde al ID ingresado (soporta id o el objeto entero)
  const objetoSeleccionado =
    typeof value === 'object' && value !== null
      ? value
      : datos.find((c) => String(c.id) === String(value)) ?? null;

  return (
    <Combobox
      {...props}
      id={id}
      items={datos}
      disabled={cargando}
      // 3. Garantiza que Base UI SIEMPRE reciba un valor definido (Objeto o null) desde el primer render
      value={objetoSeleccionado}
      onValueChange={(campusSeleccionado) => {
        if (campusSeleccionado) {
          onSelect?.(campusSeleccionado.id);
        } else {
          onSelect?.(null);
        }
      }}
      itemToStringValue={(campus) => String(campus?.id ?? '')}
      itemToStringLabel={(campus) => campus?.nombre ?? ''}
    >
      <ComboboxInput
        placeholder={cargando ? "Cargando campuses..." : "Elija un campus donde buscar"}
        aria-invalid={invalid}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {cargando ? "Cargando..." : "No se han encontrado campuses."}
        </ComboboxEmpty>
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